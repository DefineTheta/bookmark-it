import { db } from '@/db';
import { Collection, MinifiedCollection, collectionSchema } from '@/schema/Collection';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const getRequestHeaders = z.object({});
const getRequestBody = z.void();

const patchRequestHeaders = z.object({
	'content-type': z.literal('application/json'),
});
const patchRequestBody = collectionSchema.partial().omit({
	id: true,
});

const deleteRequestHeaders = z.object({});
const deleteRequestBody = z.void();

type GetRequestHeaders = z.TypeOf<typeof getRequestHeaders>;
type GetRequestBody = z.TypeOf<typeof getRequestBody>;

type PatchRequestHeaders = z.TypeOf<typeof patchRequestHeaders>;
type PatchRequestBody = z.TypeOf<typeof patchRequestBody>;

type DeleteRequestHeaders = z.TypeOf<typeof deleteRequestHeaders>;
type DeleteRequestBody = z.TypeOf<typeof deleteRequestBody>;

type GetResponseHeaders = {
	'content-type': 'application/json';
};
type GetResponseBody = {
	collection: MinifiedCollection | Collection;
};

type PatchResponseHeaders = {
	'content-type': 'application/json';
};
type PatchResponseBody = {};

type DeleteResponseHeaders = {
	'content-type': 'application/json';
};
type DeleteResponseBody = {};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/collections/[slug]?{minified}': Route<{
			GET: {
				request: {
					headers: GetRequestHeaders;
					body: GetRequestBody;
				};
				response: {
					headers: GetResponseHeaders;
					body: GetResponseBody;
				};
			};
			PATCH: {
				request: {
					headers: PatchRequestHeaders;
					body: PatchRequestBody;
				};
				response: {
					headers: PatchResponseHeaders;
					body: PatchResponseBody;
				};
			};
			DELETE: {
				request: {
					headers: DeleteRequestHeaders;
					body: DeleteRequestBody;
				};
				response: {
					headers: DeleteResponseHeaders;
					body: DeleteResponseBody;
				};
			};
		}>;
	}
}

export default makeHandler('/api/collections/[slug]?{minified}', {
	GET: {
		headers: is(getRequestHeaders),
		body: is(getRequestBody),
		exec: async ({ params }) => {
			try {
				const collectionId = Number(params.slug);
				const minified = Boolean(params.minified);

				if (minified) {
					const collection = await db
						.selectFrom('collection')
						.where('id', '=', collectionId)
						.selectAll()
						.executeTakeFirst();

					if (!collection) throw new ServerError(StatusCodes.NOT_FOUND);

					return {
						headers: {
							'content-type': 'application/json',
						},
						body: {
							collection,
						},
					};
				} else {
					const collectionData = await db
						.selectFrom('collection')
						.leftJoin('collection_links as cl', 'collection.id', 'cl.collection_id')
						.leftJoin('link', 'cl.link_id', 'link.id')
						.where('collection.id', '=', collectionId)
						.select([
							'collection.id as collection_id',
							'collection.name as collection_name',
							'collection.description as collection_description',
							'link.id as link_id',
							'link.icon as link_icon',
							'link.description as link_description',
							'link.title as link_title',
							'link.image as link_image',
							'link.link as link',
						])
						.execute();

					if (collectionData.length === 0) throw new ServerError(StatusCodes.NOT_FOUND);

					const collection: Collection = {
						id: collectionData[0].collection_id,
						name: collectionData[0].collection_name,
						description: collectionData[0].collection_description || '',
						links: [],
					};

					collectionData.forEach((data) => {
						if (
							data.link_id &&
							data.link_icon &&
							data.link_description &&
							data.link_title &&
							data.link_image &&
							data.link
						) {
							collection.links.push({
								id: data.link_id,
								icon: data.link_icon,
								description: data.link_description,
								title: data.link_title,
								image: data.link_image,
								link: data.link,
							});
						}
					});

					return {
						headers: {
							'content-type': 'application/json',
						},
						body: {
							collection,
						},
					};
				}
			} catch (err) {
				console.error(err);

				if (err instanceof ServerError) throw err;

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
	PATCH: {
		headers: is(patchRequestHeaders),
		body: is(patchRequestBody),
		exec: async ({ params, body }) => {
			try {
				const collectionId = Number(params.slug);

				const result = await db
					.updateTable('collection')
					.set(body)
					.where('id', '=', collectionId)
					.executeTakeFirstOrThrow();

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {},
				};
			} catch (err) {
				console.error(err);

				if (err instanceof ServerError) throw err;

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
	DELETE: {
		headers: is(deleteRequestHeaders),
		body: is(deleteRequestBody),
		exec: async ({ params }) => {
			try {
				const collectionId = Number(params.slug);

				const result = await db
					.deleteFrom('collection')
					.where('id', '=', collectionId)
					.executeTakeFirstOrThrow();

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {},
				};
			} catch (err) {
				console.error(err);

				if (err instanceof ServerError) throw err;

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
});

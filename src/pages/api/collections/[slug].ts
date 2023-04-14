import { db } from '@/db';
import { Collection, collectionSchema } from '@/schema/Collection';
import { Link } from '@/schema/Link';
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
	collection: Collection;
};

type PatchResponseHeaders = {
	'content-type': 'application/json';
};
type PatchResponseBody = {
	collection: Collection;
};

type DeleteResponseHeaders = {
	'content-type': 'application/json';
};
type DeleteResponseBody = {};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/collections/[slug]': Route<{
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

export default makeHandler('/api/collections/[slug]', {
	GET: {
		headers: is(getRequestHeaders),
		body: is(getRequestBody),
		exec: async ({ params }) => {
			try {
				const collectionData = await db
					.selectFrom('collection')
					.innerJoin('collection_links as cl', 'collection.id', 'cl.collection_id')
					.innerJoin('link', 'cl.link_id', 'link.id')
					.where('collection.id', '=', Number(params.slug))
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
					links: collectionData.reduce((links: Link[], linkData) => {
						links.push({
							id: linkData.link_id,
							icon: linkData.link_icon,
							description: linkData.link_description,
							title: linkData.link_title,
							image: linkData.link_image,
							link: linkData.link,
						});

						return links;
					}, []),
				};

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {
						collection,
					},
				};
			} catch (e) {
				console.error(e);

				if (e instanceof ServerError) throw e;

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
	PATCH: {
		headers: is(patchRequestHeaders),
		body: is(patchRequestBody),
		exec: async ({ params }) => {},
	},
	DELETE: {
		headers: is(deleteRequestHeaders),
		body: is(deleteRequestBody),
		exec: async ({}) => {},
	},
});

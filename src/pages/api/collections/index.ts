import { db } from '@/db';
import { Collection, MinifiedCollection } from '@/schema/Collection';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const getRequestHeaders = z.object({});
const getRequestBody = z.void();

const postRequestHeaders = z.object({
	'content-type': z.literal('application/json'),
});
const postRequestBody = z.object({
	name: z.string(),
	description: z.string().optional(),
});

type GetRequestHeaders = z.TypeOf<typeof getRequestHeaders>;
type GetRequestBody = z.TypeOf<typeof getRequestBody>;

type PostRequestHeaders = z.TypeOf<typeof postRequestHeaders>;
type PostRequestBody = z.TypeOf<typeof postRequestBody>;

type GetResponseHeaders = {
	'content-type': 'application/json';
};
type GetResponseBody = {
	collections: Collection[] | MinifiedCollection[];
};

type PostResponseHeaders = {
	'content-type': 'application/json';
};
type PostResponseBody = {
	id: number;
};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/collections?{minified}': Route<{
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
			POST: {
				request: {
					headers: PostRequestHeaders;
					body: PostRequestBody;
				};
				response: {
					headers: PostResponseHeaders;
					body: PostResponseBody;
				};
			};
		}>;
	}
}

export default makeHandler('/api/collections?{minified}', {
	GET: {
		headers: is(getRequestHeaders),
		body: is(getRequestBody),
		exec: async ({ params }) => {
			try {
				const minified = Boolean(params.minified);

				if (minified) {
					const collections = await db.selectFrom('collection').selectAll().execute();

					return {
						headers: {
							'content-type': 'application/json',
						},
						body: {
							collections,
						},
					};
				} else {
					const collectionData = await db
						.selectFrom('collection')
						.leftJoin('collection_links as cl', 'collection.id', 'cl.collection_id')
						.leftJoin('link', 'cl.link_id', 'link.id')
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

					const collectionMap: Record<string, Collection> = {};

					collectionData.forEach((data) => {
						if (!collectionMap.hasOwnProperty(data.collection_id)) {
							collectionMap[data.collection_id] = {
								id: data.collection_id,
								name: data.collection_name,
								description: data.collection_description || '',
								links: [],
							};
						}

						if (
							data.link_id &&
							data.link_icon &&
							data.link_description &&
							data.link_title &&
							data.link_image &&
							data.link
						) {
							collectionMap[data.collection_id].links.push({
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
							collections: Object.values(collectionMap),
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
	POST: {
		headers: is(postRequestHeaders),
		body: is(postRequestBody),
		exec: async ({ body }) => {
			try {
				const collection = await db
					.insertInto('collection')
					.values({
						name: body.name,
						description: body.description,
					})
					.returning('id')
					.executeTakeFirstOrThrow();

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {
						id: collection.id,
					},
				};
			} catch (e) {
				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
});

import { db } from '@/db';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const postRequestHeaders = z.object({
	'content-type': z.literal('application/json'),
});
const postRequestBody = z.object({
	name: z.string(),
	description: z.string().optional(),
});

type PostRequestHeaders = z.TypeOf<typeof postRequestHeaders>;
type PostRequestBody = z.TypeOf<typeof postRequestBody>;

type PostResponseHeaders = {
	'content-type': 'application/json';
};
type PostResponseBody = {
	id: number;
};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/collections': Route<{
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

export default makeHandler('/api/collections', {
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

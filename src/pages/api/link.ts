import { db } from '@/db';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const postRequestHeaders = z.object({
	'content-type': z.literal('application/json'),
});
const postRequestBody = z.object({
	title: z.string(),
	link: z.string(),
});

type PostRequestHeaders = z.TypeOf<typeof postRequestHeaders>;
type PostRequestBody = z.TypeOf<typeof postRequestBody>;

type PostResponseHeaders = {
	'content-type': 'application/json';
};
type PostReponseBody = {
	id: number;
};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/link': Route<{
			POST: {
				request: {
					headers: PostRequestHeaders;
					body: PostRequestBody;
				};
				response: {
					headers: PostResponseHeaders;
					body: PostReponseBody;
				};
			};
		}>;
	}
}

export default makeHandler('/api/link', {
	POST: {
		headers: is(postRequestHeaders),
		body: is(postRequestBody),
		exec: async ({ body }) => {
			try {
				const result = await db
					.insertInto('link')
					.values({
						title: body.title,
						link: body.link,
					})
					.returning('id')
					.executeTakeFirst();

				if (!result) throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {
						id: result.id,
					},
				};
			} catch (e) {
				console.error(e);

				if (e instanceof ServerError) throw e;

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
});

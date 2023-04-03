import { db } from '@/db';
import { Link } from '@/schema/Link';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import getMetaData from 'metadata-scraper';
import { z } from 'zod';

const getRequestHeaders = z.object({});
const getRequestBody = z.void();
const postRequestHeaders = z.object({
	'content-type': z.literal('application/json'),
});
const postRequestBody = z.object({
	title: z.string(),
	link: z.string(),
});

type GetRequestHeaders = z.TypeOf<typeof getRequestHeaders>;
type GetRequestBody = z.TypeOf<typeof getRequestBody>;
type PostRequestHeaders = z.TypeOf<typeof postRequestHeaders>;
type PostRequestBody = z.TypeOf<typeof postRequestBody>;

type GetResponseHeaders = {
	'content-type': 'application/json';
};
type GetReponseBody = {
	links: Link[];
};
type PostResponseHeaders = {
	'content-type': 'application/json';
};
type PostReponseBody = {
	id: number;
};

declare module '@theta-cubed/next-rest' {
	interface API {
		'/api/links': Route<{
			GET: {
				request: {
					headers: GetRequestHeaders;
					body: GetRequestBody;
				};
				response: {
					headers: GetResponseHeaders;
					body: GetReponseBody;
				};
			};
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

export default makeHandler('/api/links', {
	GET: {
		headers: is(getRequestHeaders),
		body: is(getRequestBody),
		exec: async () => {
			const links = await db.selectFrom('link').selectAll().execute();

			return {
				headers: {
					'content-type': 'application/json',
				},
				body: {
					links,
				},
			};
		},
	},
	POST: {
		headers: is(postRequestHeaders),
		body: is(postRequestBody),
		exec: async ({ body }) => {
			try {
				const metadata = await getMetaData(body.link);

				console.log(metadata);

				// const result = await db
				// 	.insertInto('link')
				// 	.values({
				// 		title: body.title,
				// 		link: body.link,
				// 	})
				// 	.returning('id')
				// 	.executeTakeFirst();

				// if (!result) throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);

				return {
					headers: {
						'content-type': 'application/json',
					},
					body: {
						id: 0,
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

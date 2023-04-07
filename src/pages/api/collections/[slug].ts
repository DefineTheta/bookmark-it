import { db } from '@/db';
import { Collection } from '@/schema/Collection';
import { is } from '@/util/next-rest';
import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const getRequestHeaders = z.object({});
const getRequestBody = z.void();

type GetRequestHeaders = z.TypeOf<typeof getRequestHeaders>;
type GetRequestBody = z.TypeOf<typeof getRequestBody>;

type GetResponseHeaders = {
	'content-type': 'application/json';
};
type GetResponseBody = {
	collection: Collection;
};

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
		}>;
	}
}

export default makeHandler('/api/collections/[slug]', {
	GET: {
		headers: is(getRequestHeaders),
		body: is(getRequestBody),
		exec: async ({ params }) => {
			try {
				const collection = await db
					.selectFrom('collection')
					.selectAll()
					.where('id', '=', Number(params.slug))
					.executeTakeFirstOrThrow();

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

				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
			}
		},
	},
});

// import { Link } from '@/schema/Link';
// import { is } from '@/util/next-rest';
// import { ServerError, makeHandler } from '@theta-cubed/next-rest/server';
// import { StatusCodes } from 'http-status-codes';
// import { z } from 'zod';

// const getRequestHeaders = z.object({ 'content-type': z.literal('application/json') });
// const getRequestBody = z.void();

// type GetRequestHeaders = z.TypeOf<typeof getRequestHeaders>;
// type GetRequestBody = z.TypeOf<typeof getRequestBody>;

// type GetResponseHeaders = {
// 	'content-type': 'application/json';
// };
// type GetResponseBody = {
// 	links: Link[];
// };

// declare module '@theta-cubed/next-rest' {
// 	interface API {
// 		'/api/collections/[collectionId]/links': Route<{
// 			GET: {
// 				request: {
// 					headers: GetRequestHeaders;
// 					body: GetRequestBody;
// 				};
// 				response: {
// 					headers: GetResponseHeaders;
// 					body: GetResponseBody;
// 				};
// 			};
// 		}>;
// 	}
// }

// export default makeHandler('/api/collections/[collectionId]/links', {
// 	GET: {
// 		headers: is(getRequestHeaders),
// 		body: is(getRequestBody),
// 		exec: async ({ params }) => {
// 			try {
// 				const links =

// 			} catch (e) {
// 				console.error(e);

// 				throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR);
// 			}
// 		},
// 	},
// });

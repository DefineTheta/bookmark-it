import { is } from "@/util/next-rest";
import { Route } from "@theta-cubed/next-rest";
import { makeHandler } from "@theta-cubed/next-rest/server";
import { z } from "zod";

const GetRequestHeaders = z.object({});
const GetRequestBody = z.void();

type GetRequestHeaders = z.TypeOf<typeof GetRequestHeaders>;
type GetRequestBody = z.TypeOf<typeof GetRequestBody>;

type GetResponseHeaders = {
  "content-type": "application/json";
};
type GetResponseBody = {
  response: string;
};

declare module "@theta-cubed/next-rest" {
  interface API {
    "/api/hello": Route<{
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

export default makeHandler("/api/hello", {
  GET: {
    headers: is(GetRequestHeaders),
    body: is(GetRequestBody),
    exec: async () => {
      return {
        headers: {
          "content-type": "application/json",
        },
        body: {
          response: "world",
        },
      };
    },
  },
});

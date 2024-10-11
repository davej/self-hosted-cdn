import { serveFromR2 } from "./serveFromR2";
import type { Env } from "./types";

const fetch: ExportedHandlerFetchHandler<Env> = async (request, env, ctx) => {
  const url = new URL(request.url);
  const objectName = decodeURIComponent(url.pathname.slice(1));
  console.log(`objectName: ${objectName}`);

  if (objectName === "") {
    return new Response(`Bad Request`, {
      status: 400,
    });
  }
  return fetchFromPath(objectName, request, env, ctx);
};

export async function fetchFromPath(
  path: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  return serveFromR2(path, request, env, ctx);
}

export default {
  fetch,
};

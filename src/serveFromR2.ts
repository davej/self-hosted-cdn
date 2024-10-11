import parseRange from "range-parser";
import makeDownloadFileName from "./makeDownloadFileName";
import { objectNotFound } from "./objectNotFound";
import type { Env, ParsedRange } from "./types";
import { getRangeHeader, hasBody, rangeHasLength } from "./utils/utils";

export async function serveFromR2(
  path: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Since we produce this result from the request, we don't need to strictly use an R2Range
  let range: ParsedRange | undefined;

  let file: R2Object | R2ObjectBody | null | undefined;

  // Range handling
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    file = await env.R2_BUCKET.head(path);
    if (file === null) {
      return objectNotFound(path);
    }
    const parsedRanges = parseRange(file.size, rangeHeader);
    // R2 only supports 1 range at the moment, reject if there is more than one
    if (
      parsedRanges !== -1 &&
      parsedRanges !== -2 &&
      parsedRanges.length === 1 &&
      parsedRanges.type === "bytes"
    ) {
      const firstRange = parsedRanges[0];
      range =
        file.size === firstRange.end + 1
          ? { suffix: file.size - firstRange.start }
          : {
              offset: firstRange.start,
              length: firstRange.end - firstRange.start + 1,
            };
    } else {
      return new Response("Range Not Satisfiable", { status: 416 });
    }
  }

  // Etag/If-(Not)-Match handling
  // R2 requires that etag checks must not contain quotes, and the S3 spec only allows one etag
  // This silently ignores invalid or weak (W/) headers
  const getHeaderEtag = (header: string | null) =>
    header?.trim().replace(/^['"]|['"]$/g, "");
  const ifMatch = getHeaderEtag(request.headers.get("if-match"));
  const ifNoneMatch = getHeaderEtag(request.headers.get("if-none-match"));

  const ifModifiedSince = Date.parse(
    request.headers.get("if-modified-since") || ""
  );
  const ifUnmodifiedSince = Date.parse(
    request.headers.get("if-unmodified-since") || ""
  );

  const ifRange = request.headers.get("if-range");
  if (range && ifRange && file) {
    const maybeDate = Date.parse(ifRange);

    if (isNaN(maybeDate) || new Date(maybeDate) > file.uploaded) {
      // httpEtag already has quotes, no need to use getHeaderEtag
      if (ifRange.startsWith("W/") || ifRange !== file.httpEtag)
        range = undefined;
    }
  }

  if (ifMatch || ifUnmodifiedSince) {
    file = await env.R2_BUCKET.get(path, {
      onlyIf: {
        etagMatches: ifMatch,
        uploadedBefore: ifUnmodifiedSince
          ? new Date(ifUnmodifiedSince)
          : undefined,
      },
      range,
    });

    if (file && !hasBody(file)) {
      return new Response("Precondition Failed", { status: 412 });
    }
  }

  if (ifNoneMatch || ifModifiedSince) {
    // if-none-match overrides if-modified-since completely
    if (ifNoneMatch) {
      file = await env.R2_BUCKET.get(path, {
        onlyIf: { etagDoesNotMatch: ifNoneMatch },
        range,
      });
    } else if (ifModifiedSince) {
      file = await env.R2_BUCKET.get(path, {
        onlyIf: { uploadedAfter: new Date(ifModifiedSince) },
        range,
      });
    }
    if (file && !hasBody(file)) {
      return new Response(null, { status: 304 });
    }
  }

  file =
    request.method === "HEAD"
      ? await env.R2_BUCKET.head(path)
      : file && hasBody(file)
      ? file
      : await env.R2_BUCKET.get(path, { range });

  if (file === null) {
    return objectNotFound(path);
  }

  return new Response(hasBody(file) && file.size !== 0 ? file.body : null, {
    status: range ? 206 : 200,
    headers: {
      "accept-ranges": "bytes",
      etag: file.httpEtag,
      "cache-control": "no-store",
      expires: file.httpMetadata.cacheExpiry?.toUTCString() ?? "",
      "last-modified": file.uploaded.toUTCString(),
      "content-encoding": file.httpMetadata?.contentEncoding ?? "",
      "content-type":
        file.httpMetadata?.contentType ?? "application/octet-stream",
      "content-language": file.httpMetadata?.contentLanguage ?? "",
      "content-disposition": `attachment; filename="${makeDownloadFileName(
        path
      )}"`,
      "content-range": range ? getRangeHeader(range, file.size) : "",
      "content-length": (range
        ? rangeHasLength(range)
          ? range.length
          : range.suffix
        : file.size
      ).toString(),
    },
  });
}

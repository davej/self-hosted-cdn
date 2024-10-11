export function objectNotFound(
  objectName: string,
  responseCode?: number,
  message?: string
): Response {
  return new Response(message ?? `${objectName} not found`, {
    status: responseCode ?? 404,
  });
}

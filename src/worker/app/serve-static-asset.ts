/**
 * Hands a non-API request to Workers Static Assets (single-page-app
 * fallback, brief section 4). The response is re-wrapped because a fetched
 * response's headers are immutable, and the security-headers middleware
 * must still be able to add its headers afterwards (T-066).
 */
export async function serveStaticAsset(assets: Fetcher, request: Request): Promise<Response> {
  const response = await assets.fetch(request);
  return new Response(response.body, response);
}

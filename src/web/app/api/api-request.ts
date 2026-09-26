import { ApiError } from './api-error';

export type GetSessionToken = () => Promise<string | null>;

/**
 * Every API call: the Clerk session token in the `Authorization` header,
 * never a cookie (brief section 6.3), JSON in and out, and a refusal turned
 * into an `ApiError` carrying the Worker's code.
 */
export async function apiRequest<T>(
  getToken: GetSessionToken,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await getToken();
  const headers = new Headers({ Accept: 'application/json' });
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { code?: string; values?: Record<string, number> };
    } | null;
    throw new ApiError(response.status, body?.error?.code ?? 'server.error', body?.error?.values);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

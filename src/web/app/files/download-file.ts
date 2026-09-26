import { ApiError } from '../api/api-error';
import type { GetSessionToken } from '../api/api-request';

/**
 * Brief 9.3, downloads in the browser: the portal checks permission with
 * the officer's session, then sends the file or a short-lived link, which
 * the request follows; the file is saved to the device under its name.
 */
export async function downloadFile(
  getToken: GetSessionToken,
  path: string,
  fileName: string,
): Promise<void> {
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${(await getToken()) ?? ''}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
    throw new ApiError(res.status, body?.error?.code ?? 'server.error');
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(await res.blob());
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

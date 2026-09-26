import type { useApiRequest } from '../api/use-api-request';
import { sendToStorage, type Started } from './send-to-storage';

type Request = ReturnType<typeof useApiRequest>;

interface UploadPaths {
  start: string;
  /** The complete path, or how to name it from the start's answer. */
  complete: string | ((started: Started) => string);
}

/**
 * Brief 9.3 in the browser: send the file to storage, then ask the portal
 * to complete it, which records it, with any details the record needs.
 */
export async function uploadFile<T = unknown>(
  request: Request,
  paths: UploadPaths,
  file: { body: Blob; fileName: string; contentType: string },
  details: Record<string, unknown> = {},
): Promise<T> {
  const { started, sent } = await sendToStorage(request, paths.start, file);
  const complete = typeof paths.complete === 'string' ? paths.complete : paths.complete(started);
  return request<T>(complete, { method: 'PUT', body: { ...details, ...sent } });
}

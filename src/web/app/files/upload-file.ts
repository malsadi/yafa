import type { StartedUpload } from '../../../shared/core/file-record';
import type { useApiRequest } from '../api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;
type Started = StartedUpload & Record<string, unknown>;

interface UploadPaths {
  start: string;
  /** The complete path, or how to name it from the start's answer. */
  complete: string | ((started: Started) => string);
}

/**
 * Brief 9.3 in the browser: ask the portal for the upload link (it checks
 * permission, type and size), send the file straight to R2 — in parts for a
 * large one — then ask the portal to complete it, which records it, with
 * any details the record needs.
 */
export async function uploadFile<T = unknown>(
  request: Request,
  paths: UploadPaths,
  file: { body: Blob; fileName: string; contentType: string },
  details: Record<string, unknown> = {},
): Promise<T> {
  const started = await request<Started>(paths.start, {
    method: 'POST',
    body: { fileName: file.fileName, size: file.body.size, contentType: file.contentType },
  });
  const put = async (url: string, body: Blob) => {
    const res = await fetch(url, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': file.contentType },
    });
    if (!res.ok) throw new Error('files.upload-failed');
    return res.headers.get('ETag') ?? '';
  };
  const complete = typeof paths.complete === 'string' ? paths.complete : paths.complete(started);
  const body = { ...details, fileId: started.fileId, fileName: file.fileName };
  if (started.kind === 'single') {
    await put(started.url, file.body);
    return request<T>(complete, { method: 'PUT', body });
  }
  const parts = [];
  for (const [index, url] of started.partUrls.entries()) {
    const slice = file.body.slice(index * started.partSize, (index + 1) * started.partSize);
    parts.push({ partNumber: index + 1, etag: await put(url, slice) });
  }
  return request<T>(complete, {
    method: 'PUT',
    body: { ...body, multipart: { uploadId: started.uploadId, parts } },
  });
}

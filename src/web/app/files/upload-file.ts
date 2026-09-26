import type { StartedUpload } from '../../../shared/core/file-record';
import type { useApiRequest } from '../api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

/**
 * Brief 9.3 in the browser: ask the portal for the upload link (it checks
 * permission, type and size), send the file straight to R2 — in parts for a
 * large one — then ask the portal to complete it, which records it.
 */
export async function uploadFile(
  request: Request,
  paths: { start: string; complete: string },
  file: { body: Blob; fileName: string; contentType: string },
): Promise<void> {
  const started = await request<StartedUpload>(paths.start, {
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
  if (started.kind === 'single') {
    await put(started.url, file.body);
    await request<unknown>(paths.complete, {
      method: 'PUT',
      body: { fileId: started.fileId, fileName: file.fileName },
    });
    return;
  }
  const parts = [];
  for (const [index, url] of started.partUrls.entries()) {
    const slice = file.body.slice(index * started.partSize, (index + 1) * started.partSize);
    parts.push({ partNumber: index + 1, etag: await put(url, slice) });
  }
  await request<unknown>(paths.complete, {
    method: 'PUT',
    body: {
      fileId: started.fileId,
      fileName: file.fileName,
      multipart: { uploadId: started.uploadId, parts },
    },
  });
}

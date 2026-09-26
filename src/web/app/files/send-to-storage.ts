import type { StartedUpload } from '../../../shared/core/file-record';
import type { useApiRequest } from '../api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;
export type Started = StartedUpload & Record<string, unknown>;

/** What the portal needs to record a file once it is in storage (9.3's "complete"). */
export interface SentFile {
  fileId: string;
  fileName: string;
  multipart?: { uploadId: string; parts: { partNumber: number; etag: string }[] };
}

/**
 * Brief 9.3 in the browser, up to the "complete" step: ask the portal for
 * the upload link (it checks permission, type and size), and send the file
 * straight to storage — in parts for a large one.
 */
export async function sendToStorage(
  request: Request,
  startPath: string,
  file: { body: Blob; fileName: string; contentType: string },
  startDetails: Record<string, unknown> = {},
): Promise<{ started: Started; sent: SentFile }> {
  const started = await request<Started>(startPath, {
    method: 'POST',
    body: {
      ...startDetails,
      fileName: file.fileName,
      size: file.body.size,
      contentType: file.contentType,
    },
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
    return { started, sent: { fileId: started.fileId, fileName: file.fileName } };
  }
  const parts = [];
  for (const [index, url] of started.partUrls.entries()) {
    const slice = file.body.slice(index * started.partSize, (index + 1) * started.partSize);
    parts.push({ partNumber: index + 1, etag: await put(url, slice) });
  }
  const multipart = { uploadId: started.uploadId, parts };
  return { started, sent: { fileId: started.fileId, fileName: file.fileName, multipart } };
}

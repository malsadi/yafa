import type { FileUse } from './file-uses';

/** Brief 9.3: one stored file, as its record keeps it. */
export interface FileRecord {
  id: string;
  key: string;
  unitId: string;
  service: string;
  recordId: string;
  use: FileUse;
  fileName: string;
  uploadedBy: string;
  size: number;
  contentType: string;
  checksum: string;
  locked: boolean;
  createdAt: string;
}

/** Brief 9.3: where the browser sends the file — one link, or one link per part. */
export type StartedUpload =
  | { fileId: string; kind: 'single'; url: string }
  | { fileId: string; kind: 'multipart'; uploadId: string; partSize: number; partUrls: string[] };

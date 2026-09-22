import type { ServiceSlug } from '../../../shared/core/services';
import { sanitizeFileName } from './sanitize-file-name';

const R2_MAX_KEY_BYTES = 1024;

export interface BuildObjectKeyParams {
  unitCode: string;
  service: ServiceSlug;
  recordId: string;
  fileId: string;
  /** The officer's original file name — sanitized internally, never reduced to ASCII. */
  fileName: string;
}

/**
 * Brief section 9.3's R2 object key shape:
 * `{unitCode}/{service}/{recordId}/{fileId}-{safeName}`. The rest of
 * section 9.3 (the `files` table, presigned upload/download, orphan
 * clean-up) is Phase 3's `fileRecord()` — brief section 26 names it there
 * explicitly. This is the one piece with no R2 binding or `files` table
 * dependency, safe to build now.
 */
export function buildObjectKey(params: BuildObjectKeyParams): string {
  const safeName = sanitizeFileName(params.fileName);
  const key = `${params.unitCode}/${params.service}/${params.recordId}/${params.fileId}-${safeName}`;

  if (new TextEncoder().encode(key).length > R2_MAX_KEY_BYTES) {
    throw new RangeError(`buildObjectKey: key exceeds R2's ${String(R2_MAX_KEY_BYTES)}-byte limit`);
  }
  return key;
}

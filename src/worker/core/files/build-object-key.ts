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
 * `{unitCode}/{service}/{recordId}/{fileId}-{safeName}`. The rest of the
 * file layer (D-087, built in Phase 2) uses it for every object.
 */
export function buildObjectKey(params: BuildObjectKeyParams): string {
  const safeName = sanitizeFileName(params.fileName);
  const key = `${params.unitCode}/${params.service}/${params.recordId}/${params.fileId}-${safeName}`;

  if (new TextEncoder().encode(key).length > R2_MAX_KEY_BYTES) {
    throw new RangeError(`buildObjectKey: key exceeds R2's ${String(R2_MAX_KEY_BYTES)}-byte limit`);
  }
  return key;
}

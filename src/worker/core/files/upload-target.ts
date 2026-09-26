import type { FileUse } from '../../../shared/core/file-uses';
import type { ServiceSlug } from '../../../shared/core/services';
import { buildObjectKey } from './build-object-key';

/**
 * Where a file belongs: the owner unit, the service and record it is for,
 * and its use. Supplied by the calling feature after its own permission
 * check — never by the browser (brief 9.3: "the Worker checks permission").
 */
export interface UploadTarget {
  unitId: string;
  unitCode: string;
  service: ServiceSlug;
  recordId: string;
  use: FileUse;
}

export function objectKeyFor(target: UploadTarget, fileId: string, fileName: string): string {
  return buildObjectKey({ ...target, fileId, fileName });
}

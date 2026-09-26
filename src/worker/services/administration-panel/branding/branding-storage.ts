import type { R2Access } from '../../../core/files';

/** The files bucket, and its signing details read only when a link is needed (D-087). */
export interface BrandingStorage {
  bucket: R2Bucket;
  access: () => R2Access;
}

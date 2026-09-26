import type { R2Access } from './r2-access';

/** The files bucket, and its signing details read only when a link is needed (D-087). */
export interface FileStorage {
  bucket: R2Bucket;
  access: () => R2Access;
}

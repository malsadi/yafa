import { ConflictError } from '../../../core/errors';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * D-084: an icon must be a square PNG of exactly the size its slot needs.
 * Read from the PNG header (its width and height, bytes 16 to 23), so a
 * mislabelled or wrongly sized file is never recorded.
 */
export async function requireSquarePng(bucket: R2Bucket, key: string, size: number): Promise<void> {
  const object = await bucket.get(key, { range: { offset: 0, length: 24 } });
  const bytes = object ? new Uint8Array(await object.arrayBuffer()) : new Uint8Array();
  const view = new DataView(bytes.buffer);
  const isPng = bytes.length === 24 && PNG_SIGNATURE.every((b, i) => bytes[i] === b);
  if (!isPng || view.getUint32(16) !== size || view.getUint32(20) !== size) {
    await bucket.delete(key);
    throw new ConflictError('branding.icon-not-square');
  }
}

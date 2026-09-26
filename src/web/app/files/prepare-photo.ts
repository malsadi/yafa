import { fitWithin } from './fit-within';

/**
 * Brief 9.3: a photo taken on a phone becomes a JPEG no larger than the
 * maximum image dimension, on the device, before it is uploaded.
 */
export async function preparePhoto(source: Blob, maxDimension: number): Promise<Blob> {
  const image = await createImageBitmap(source);
  const { width, height } = fitWithin(image.width, image.height, maxDimension);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('files.photo-not-readable');
  context.drawImage(image, 0, 0, width, height);
  return canvas.convertToBlob({ type: 'image/jpeg' });
}

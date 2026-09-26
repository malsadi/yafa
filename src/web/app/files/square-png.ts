/**
 * D-084: a square PNG of exactly `size` pixels, drawn from the uploaded
 * square icon, for the two sizes phones need. Refuses an image that isn't
 * square, rather than cropping it.
 */
export async function squarePng(source: Blob, size: number): Promise<Blob> {
  const image = await createImageBitmap(source);
  if (image.width !== image.height) throw new Error('branding.icon-not-square');
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('branding.icon-not-square');
  context.drawImage(image, 0, 0, size, size);
  return canvas.convertToBlob({ type: 'image/png' });
}

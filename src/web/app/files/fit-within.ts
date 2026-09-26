/**
 * Brief 9.3: the size a photo is resized to on the device before upload —
 * scaled down, keeping its shape, so neither side exceeds the maximum image
 * dimension the administrator sets. A smaller photo is left as it is.
 */
export function fitWithin(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

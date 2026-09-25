/**
 * D-082: a branding colour must work against white "at normal reading
 * contrast". Taken as WCAG 2's level AA for normal text: a contrast ratio of
 * at least 4.5 to 1. That threshold is WCAG's own definition of the phrase,
 * not a value anyone configures.
 */
export const NORMAL_READING_CONTRAST = 4.5;

function channel(hex: string): number {
  const value = Number.parseInt(hex, 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2 relative luminance of a #RRGGBB colour. */
function luminance(colour: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => channel(colour.slice(start, start + 2)));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** The contrast ratio of a #RRGGBB colour against white, from 1 to 21. */
export function contrastAgainstWhite(colour: string): number {
  return 1.05 / (luminance(colour) + 0.05);
}

export function readsOnWhite(colour: string): boolean {
  return contrastAgainstWhite(colour) >= NORMAL_READING_CONTRAST;
}

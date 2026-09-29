import arabicFont from '../../../../branding/fonts/arabic.woff2?inline';
import latinFont from '../../../../branding/fonts/latin.woff2?inline';
import logo from '../../../../branding/logo.png?inline';
import type { PdfFont } from '../../../core/pdf';

/** A bundled file's bytes, from the `data:` URL the build makes of it. */
function bytesOf(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
}

/** D-223: the fixed logo as a `data:` URL, since a render reaches nothing outside the page (core/pdf). */
export const LOGO_DATA_URL = logo;

/** D-223: the fixed Latin and Arabic fonts, embedded under the names the design uses. */
export function letterheadFonts(): PdfFont[] {
  return [
    { family: 'Portal Latin', data: bytesOf(latinFont), format: 'woff2' },
    { family: 'Portal Arabic', data: bytesOf(arabicFont), format: 'woff2' },
  ];
}

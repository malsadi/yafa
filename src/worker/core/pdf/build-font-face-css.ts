import type { PdfFont } from './pdf-font';

const MIME_TYPES: Record<PdfFont['format'], string> = {
  truetype: 'font/ttf',
  opentype: 'font/otf',
  woff2: 'font/woff2',
};

function toBase64(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * `@font-face` rules with each font embedded as a `data:` URL, so the
 * rendering browser never fetches a font from anywhere (brief section 8.5).
 */
export function buildFontFaceCss(fonts: readonly PdfFont[]): string {
  return fonts
    .map((font) => {
      const source = `url(data:${MIME_TYPES[font.format]};base64,${toBase64(font.data)}) format('${font.format}')`;
      return [
        '@font-face {',
        `  font-family: ${JSON.stringify(font.family)};`,
        `  src: ${source};`,
        `  font-weight: ${font.weight ?? 'normal'};`,
        `  font-style: ${font.style ?? 'normal'};`,
        '}',
      ].join('\n');
    })
    .join('\n');
}

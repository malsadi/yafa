import { RIGHT_TO_LEFT_LANGUAGES, type Language } from '../../../shared/core/languages';
import { buildFontFaceCss } from './build-font-face-css';
import type { PdfFont } from './pdf-font';

export interface PdfDocumentInput {
  /** The rendered template body (brief section 9.4: `src/pdf-templates/`). */
  bodyHtml: string;
  /** The shared stylesheet plus any template stylesheet, already combined. */
  css: string;
  language: Language;
  fonts: readonly PdfFont[];
}

/**
 * The complete HTML page Browser Rendering prints: the language and its
 * direction on `<html>` (brief section 9.4: "the correct direction and
 * fonts"), the fonts embedded, then the stylesheet and the body.
 */
export function buildPdfDocument(input: PdfDocumentInput): string {
  const dir = RIGHT_TO_LEFT_LANGUAGES.includes(input.language) ? 'rtl' : 'ltr';
  return [
    '<!doctype html>',
    `<html lang="${input.language}" dir="${dir}">`,
    '<head>',
    '<meta charset="utf-8">',
    `<style>\n${buildFontFaceCss(input.fonts)}\n${input.css}\n</style>`,
    '</head>',
    `<body>${input.bodyHtml}</body>`,
    '</html>',
  ].join('\n');
}

import { buildLetterhead } from '../../../../pdf-templates/letterhead/build-letterhead';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { ServiceUnavailableError } from '../../../core/errors';
import { renderPdf } from '../../../core/pdf';
import { LOGO_DATA_URL, letterheadFonts } from './letterhead-assets';
import type { PdfRendering } from './pdf-rendering';

// D-081: the design's page, fixed like the rest of it.
const PAGE = {
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
} as const;

/**
 * Brief 9.4 and 15 C3: a letter on the one letterhead as a PDF, with the
 * fixed logo and fonts (D-223) — one Browser Rendering call. The caller
 * checks permission first. Where rendering isn't bound, it says so.
 */
export async function renderOnLetterhead(
  services: PdfRendering,
  input: Omit<LetterheadInput, 'logoSrc'>,
): Promise<Uint8Array> {
  if (!services.browser) throw new ServiceUnavailableError('pdf.not-available');
  const { bodyHtml, css } = buildLetterhead({ ...input, logoSrc: LOGO_DATA_URL });
  const fonts = letterheadFonts();
  return renderPdf(services.browser, { bodyHtml, css, language: input.language, fonts }, PAGE);
}

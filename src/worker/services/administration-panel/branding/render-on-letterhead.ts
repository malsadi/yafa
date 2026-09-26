import type { BrowserWorker } from '@cloudflare/puppeteer';
import { buildLetterhead } from '../../../../pdf-templates/letterhead/build-letterhead';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { ServiceUnavailableError } from '../../../core/errors';
import { renderPdf } from '../../../core/pdf';
import { letterheadFonts, logoDataUrl } from './letterhead-assets';

// D-081: the design's page, fixed like the rest of it.
const PAGE = {
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
} as const;

/**
 * Brief 9.4 and 15 C3: a letter on the one letterhead as a PDF, with the
 * real logo and the uploaded fonts — one Browser Rendering call. The caller
 * checks permission first. Where rendering isn't bound, it says so.
 */
export async function renderOnLetterhead(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
  input: Omit<LetterheadInput, 'logoSrc'>,
): Promise<Uint8Array> {
  if (!services.browser) throw new ServiceUnavailableError('pdf.not-available');
  const { bodyHtml, css } = buildLetterhead({
    ...input,
    logoSrc: await logoDataUrl(db, services.bucket),
  });
  const fonts = await letterheadFonts(db, services.bucket);
  return renderPdf(services.browser, { bodyHtml, css, language: input.language, fonts }, PAGE);
}

import type { BrowserWorker } from '@cloudflare/puppeteer';
import type { Language } from '../../../../shared/core/languages';
import { ServiceUnavailableError } from '../../../core/errors';
import { renderPdf } from '../../../core/pdf';
import { letterheadFonts } from './letterhead-assets';

// Brief 9.4: every document's page, A4 with the letterhead's margins (D-081).
const PAGE = {
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
} as const;

/**
 * Brief 9.4 and 15 C3: a document (not a letter) as a PDF in the uploaded
 * fonts — one Browser Rendering call. The caller checks permission first.
 */
export async function renderBrandedPdf(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
  document: { bodyHtml: string; css: string; language: Language },
): Promise<Uint8Array> {
  if (!services.browser) throw new ServiceUnavailableError('pdf.not-available');
  const fonts = await letterheadFonts(db, services.bucket);
  return renderPdf(services.browser, { ...document, fonts }, PAGE);
}

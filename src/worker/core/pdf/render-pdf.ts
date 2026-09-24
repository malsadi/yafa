import puppeteer, { type BrowserWorker, type PDFOptions } from '@cloudflare/puppeteer';
import { buildPdfDocument, type PdfDocumentInput } from './build-pdf-document';

/** Page size and margins come from the caller (letterhead layout, 15 C3). */
export type PdfPageOptions = Pick<PDFOptions, 'format' | 'width' | 'height' | 'margin'>;

/**
 * Renders one document to PDF through Browser Rendering (brief section
 * 9.4). Every request the page makes is refused except embedded `data:`
 * resources, so a render never reaches an outside service (brief section
 * 8.5); the fonts are embedded by `buildPdfDocument`. Waits for the fonts
 * to be ready before printing, so text is never set in a fallback font.
 */
export async function renderPdf(
  browserBinding: BrowserWorker,
  input: PdfDocumentInput,
  page: PdfPageOptions,
): Promise<Uint8Array> {
  const browser = await puppeteer.launch(browserBinding);
  try {
    const tab = await browser.newPage();
    await tab.setRequestInterception(true);
    tab.on('request', (request) => {
      if (request.url().startsWith('data:')) {
        void request.continue();
      } else {
        void request.abort();
      }
    });
    await tab.setContent(buildPdfDocument(input), { waitUntil: 'load' });
    // Runs in the page, where `document` exists; the Worker has no DOM types.
    await tab.evaluate('document.fonts.ready.then(() => true)');
    const pdf = await tab.pdf({ ...page, printBackground: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}

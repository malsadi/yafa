import type { BrowserWorker } from '@cloudflare/puppeteer';

/** What a branded PDF needs: Browser Rendering, undefined where it isn't bound, and the portal says so. */
export interface PdfRendering {
  browser: BrowserWorker | undefined;
}

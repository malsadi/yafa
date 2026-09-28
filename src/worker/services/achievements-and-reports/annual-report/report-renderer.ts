import type { BrowserWorker } from '@cloudflare/puppeteer';
import { buildAnnualReport } from '../../../../pdf-templates/annual-report/build-annual-report';
import type { AnnualReportDocument } from '../../../../pdf-templates/annual-report/annual-report-document';
import { renderBrandedPdf } from '../../administration-panel';

/** Turns a written-out annual report into PDF bytes. */
export type AnnualReportRenderer = (document: AnnualReportDocument) => Promise<Uint8Array>;

/** Brief 9.4: the annual report, rendered through Browser Rendering when it is finalised. */
export function browserAnnualReportRenderer(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
): AnnualReportRenderer {
  return (document) => {
    const { bodyHtml, css } = buildAnnualReport(document);
    return renderBrandedPdf(db, services, { bodyHtml, css, language: document.language });
  };
}

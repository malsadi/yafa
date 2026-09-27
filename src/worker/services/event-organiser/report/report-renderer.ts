import type { BrowserWorker } from '@cloudflare/puppeteer';
import { buildReport } from '../../../../pdf-templates/post-event-report/build-report';
import type { ReportDocument } from '../../../../pdf-templates/post-event-report/report-document';
import { renderBrandedPdf } from '../../administration-panel';

/** Turns a written-out post-event report into PDF bytes. */
export type ReportRenderer = (document: ReportDocument) => Promise<Uint8Array>;

/** Brief 9.4: the post-event report, rendered through Browser Rendering at close. */
export function browserReportRenderer(
  db: D1Database,
  services: { bucket: R2Bucket; browser: BrowserWorker | undefined },
): ReportRenderer {
  return (document) => {
    const { bodyHtml, css } = buildReport(document);
    return renderBrandedPdf(db, services, { bodyHtml, css, language: document.language });
  };
}

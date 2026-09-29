import { buildReport } from '../../../../pdf-templates/post-event-report/build-report';
import type { ReportDocument } from '../../../../pdf-templates/post-event-report/report-document';
import { renderBrandedPdf, type PdfRendering } from '../../administration-panel';

/** Turns a written-out post-event report into PDF bytes. */
export type ReportRenderer = (document: ReportDocument) => Promise<Uint8Array>;

/** Brief 9.4: the post-event report, rendered through Browser Rendering at close. */
export function browserReportRenderer(services: PdfRendering): ReportRenderer {
  return (document) => {
    const { bodyHtml, css } = buildReport(document);
    return renderBrandedPdf(services, { bodyHtml, css, language: document.language });
  };
}

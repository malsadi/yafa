import { buildAnnualReport } from '../../../../pdf-templates/annual-report/build-annual-report';
import type { AnnualReportDocument } from '../../../../pdf-templates/annual-report/annual-report-document';
import { renderBrandedPdf, type PdfRendering } from '../../administration-panel';

/** Turns a written-out annual report into PDF bytes. */
export type AnnualReportRenderer = (document: AnnualReportDocument) => Promise<Uint8Array>;

/** Brief 9.4: the annual report, rendered through Browser Rendering when it is finalised. */
export function browserAnnualReportRenderer(services: PdfRendering): AnnualReportRenderer {
  return (document) => {
    const { bodyHtml, css } = buildAnnualReport(document);
    return renderBrandedPdf(services, { bodyHtml, css, language: document.language });
  };
}

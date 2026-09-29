import { buildMeetingReport } from '../../../../pdf-templates/meeting-report/build-meeting-report';
import type { MeetingReportDocument } from '../../../../pdf-templates/meeting-report/meeting-report-document';
import { renderBrandedPdf, type PdfRendering } from '../../administration-panel';

/** Turns a written-out meeting report into PDF bytes. */
export type MeetingReportRenderer = (document: MeetingReportDocument) => Promise<Uint8Array>;

/** Brief 9.4: the meeting report, rendered through Browser Rendering when it is logged. */
export function browserMeetingReportRenderer(services: PdfRendering): MeetingReportRenderer {
  return (document) => {
    const { bodyHtml, css } = buildMeetingReport(document);
    return renderBrandedPdf(services, { bodyHtml, css, language: document.language });
  };
}

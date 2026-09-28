import { escapeHtml } from '../escape-html';
import { SHARED_STYLESHEET } from '../shared-stylesheet';
import type { AnnualReportDocument } from './annual-report-document';

const para = (text: string, className = 'doc-meta') =>
  `<p class="${className}">${escapeHtml(text)}</p>`;
const list = (items: string[]) =>
  `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;

/**
 * Brief 24 B2 and 9.4: the annual report — the year's achievements, events
 * completed, meetings held, the Treasury's year and the current officers,
 * with the branch's summary. The same shared stylesheet as every PDF.
 * Every value is escaped.
 */
export function buildAnnualReport(doc: AnnualReportDocument): { bodyHtml: string; css: string } {
  const sections = doc.sections
    .map((s) => `${para(s.heading, 'doc-title')}${list(s.lines)}`)
    .join('');
  const bodyHtml = `<div class="doc"><header class="doc-head">
${para(doc.organisationName, 'doc-org')}${para(doc.unitName)}${para(doc.title, 'doc-title')}${doc.details.map((d) => para(d)).join('')}</header>
${sections}</div>`;
  return { bodyHtml, css: SHARED_STYLESHEET };
}

import { escapeHtml } from '../escape-html';
import { SHARED_STYLESHEET } from '../shared-stylesheet';
import type { MeetingReportDocument } from './meeting-report-document';

const para = (text: string, className = 'doc-meta') =>
  `<p class="${className}">${escapeHtml(text)}</p>`;
const list = (items: string[]) =>
  `<ol>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`;

function attendanceTable(a: MeetingReportDocument['attendance']): string {
  const rows = a.rows
    .map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.mark)}</td></tr>`)
    .join('');
  return `${para(a.heading, 'doc-title')}<table class="doc-table"><tbody>${rows}</tbody></table>`;
}

function minutesSection(m: MeetingReportDocument['minutes']): string {
  const items = m.items
    .map(
      (item) =>
        `${para(item.title, 'doc-title')}${item.comments
          .map((c) => para(`${c.name}: ${c.comment}`, 'doc-meta'))
          .join('')}${para(item.outcome, 'doc-total')}`,
    )
    .join('');
  return `${para(m.heading, 'doc-title')}${items}`;
}

/**
 * Brief 22 C1 and 9.4: the meeting report — details, attendance, the
 * original and updated agendas, and the minutes item by item, each with its
 * comments and its vote or decision. Every value is escaped.
 */
export function buildMeetingReport(doc: MeetingReportDocument): { bodyHtml: string; css: string } {
  const bodyHtml = `<div class="doc"><header class="doc-head">
${para(doc.organisationName, 'doc-org')}${para(doc.unitName)}${para(doc.title, 'doc-title')}${doc.details.map((d) => para(d)).join('')}</header>
${attendanceTable(doc.attendance)}
${para(doc.originalAgenda.heading, 'doc-title')}${list(doc.originalAgenda.items)}
${para(doc.updatedAgenda.heading, 'doc-title')}${list(doc.updatedAgenda.items)}
${minutesSection(doc.minutes)}</div>`;
  return { bodyHtml, css: SHARED_STYLESHEET };
}

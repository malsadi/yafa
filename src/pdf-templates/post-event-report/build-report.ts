import { escapeHtml } from '../escape-html';
import { SHARED_STYLESHEET } from '../shared-stylesheet';
import type { ReportDocument } from './report-document';

const cell = (text: string, money = false) =>
  `<td${money ? ' class="doc-money"' : ''}>${escapeHtml(text)}</td>`;
const heading = (text: string, money = false) =>
  `<th${money ? ' class="doc-money"' : ''}>${escapeHtml(text)}</th>`;

function tasksTable(t: ReportDocument['tasks']): string {
  const rows = t.rows.map((r) => `<tr>${cell(r.task)}${cell(r.status)}</tr>`).join('');
  return `<p class="doc-title">${escapeHtml(t.heading)}</p><p class="doc-meta">${escapeHtml(t.summary)}</p>
<table class="doc-table"><thead><tr>${heading(t.headings.task)}${heading(t.headings.status)}</tr></thead>
<tbody>${rows}</tbody></table>`;
}

function budgetTable(b: ReportDocument['budget']): string {
  const h = b.headings;
  const row = (r: ReportDocument['budget']['totals'], total = false) =>
    `<tr${total ? ' class="doc-total"' : ''}>${cell(r.line)}${cell(r.budget, true)}${cell(r.income, true)}${cell(r.spending, true)}</tr>`;
  return `<p class="doc-title">${escapeHtml(b.heading)}</p>
<table class="doc-table"><thead><tr>${heading(h.line)}${heading(h.budget, true)}${heading(h.income, true)}${heading(h.spending, true)}</tr></thead>
<tbody>${b.rows.map((r) => row(r)).join('')}${row(b.totals, true)}
<tr class="doc-total"><td colspan="3">${escapeHtml(b.balance.label)}</td>${cell(b.balance.amount, true)}</tr></tbody></table>`;
}

/**
 * Brief 21 C1 and 9.4: the post-event report — the event, its tasks done
 * against the total, and its budget against actual income and spending,
 * with "Unallocated" (P10). Every value is escaped.
 */
export function buildReport(doc: ReportDocument): { bodyHtml: string; css: string } {
  const details = doc.details.map((d) => `<p class="doc-meta">${escapeHtml(d)}</p>`).join('');
  const bodyHtml = `<div class="doc"><header class="doc-head">
<p class="doc-org">${escapeHtml(doc.organisationName)}</p>
<p class="doc-meta">${escapeHtml(doc.unitName)}</p>
<p class="doc-title">${escapeHtml(doc.title)}</p>${details}</header>
${tasksTable(doc.tasks)}${budgetTable(doc.budget)}</div>`;
  return { bodyHtml, css: SHARED_STYLESHEET };
}

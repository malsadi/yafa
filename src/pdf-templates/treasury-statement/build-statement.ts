import { escapeHtml } from '../escape-html';
import { SHARED_STYLESHEET } from '../shared-stylesheet';
import type { StatementDocument } from './statement-document';

const cell = (text: string, money = false) =>
  `<td${money ? ' class="doc-money"' : ''}>${escapeHtml(text)}</td>`;

/**
 * Brief 17 C2 and 9.4: an account's statement — its balance at the start of
 * the period, each counted entry with the balance after it, and its balance
 * at the end. Every value is escaped.
 */
export function buildStatement(doc: StatementDocument): { bodyHtml: string; css: string } {
  const h = doc.headings;
  const head = `<tr><th>${escapeHtml(h.date)}</th><th>${escapeHtml(h.details)}</th>
<th class="doc-money">${escapeHtml(h.in)}</th><th class="doc-money">${escapeHtml(h.out)}</th>
<th class="doc-money">${escapeHtml(h.balance)}</th></tr>`;
  const total = (row: { label: string; balance: string }) =>
    `<tr class="doc-total"><td colspan="4">${escapeHtml(row.label)}</td>${cell(row.balance, true)}</tr>`;
  const rows = doc.rows
    .map(
      (r) =>
        `<tr>${cell(r.date)}${cell(r.details)}${cell(r.in, true)}${cell(r.out, true)}${cell(r.balance, true)}</tr>`,
    )
    .join('');
  const bodyHtml = `<div class="doc"><header class="doc-head">
<p class="doc-org">${escapeHtml(doc.organisationName)}</p>
<p class="doc-meta">${escapeHtml(doc.unitName)}</p>
<p class="doc-title">${escapeHtml(doc.title)}</p>
<p class="doc-meta">${escapeHtml(doc.period)}</p></header>
<table class="doc-table"><thead>${head}</thead>
<tbody>${total(doc.opening)}${rows}${total(doc.closing)}</tbody></table></div>`;
  return { bodyHtml, css: SHARED_STYLESHEET };
}

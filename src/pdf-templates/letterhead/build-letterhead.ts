import { escapeHtml } from '../escape-html';
import { SHARED_STYLESHEET } from '../shared-stylesheet';
import type { LetterheadInput } from './letterhead-input';

// A colour reaches the page only as #RRGGBB, so nothing else can enter the style attribute.
const safeColour = (colour: string) => (/^#[0-9A-Fa-f]{6}$/.test(colour) ? colour : '#000000');

function head(input: LetterheadInput): string {
  const logo = input.logoSrc
    ? `<img class="lh-logo" src="${escapeHtml(input.logoSrc)}" alt="">`
    : `<div class="lh-logo-space">${escapeHtml(input.logoPlaceholder)}</div>`;
  const address = input.unit.address
    ? `<p class="lh-address">${escapeHtml(input.unit.address)}</p>`
    : '';
  return `<header class="lh-head lh-logo-${input.logoPosition}">${logo}<div class="lh-org">
<p class="lh-org-name" style="color: ${safeColour(input.mainColour)}">${escapeHtml(input.organisationName)}</p>
<p class="lh-unit">${escapeHtml(input.unit.name)}</p>${address}</div></header>`;
}

function signature(input: LetterheadInput): string {
  const { name, role, unit } = input.letter.signer;
  return `<footer class="lh-signature"><div class="lh-sign-space"></div>
<p>${escapeHtml(name)}</p><p>${escapeHtml(role)}</p><p>${escapeHtml(unit)}</p></footer>`;
}

/**
 * D-081 and D-089: a letter on the one fixed letterhead — the same HTML for
 * the on-screen preview and the PDF (D-090). Every value is escaped.
 */
export function buildLetterhead(input: LetterheadInput): { bodyHtml: string; css: string } {
  const subject = input.letter.subject
    ? `<p class="lh-subject">${escapeHtml(input.letter.subject)}</p>`
    : '';
  const paragraphs = input.letter.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  const bodyHtml = `<div class="lh">${head(input)}
<hr class="lh-rule" style="border-top-color: ${safeColour(input.accentColour)}">
<main class="lh-body">${subject}${paragraphs}</main>${signature(input)}</div>`;
  return { bodyHtml, css: SHARED_STYLESHEET };
}

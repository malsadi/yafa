import { describe, expect, it } from 'vitest';
import { buildLetterhead } from '../../../src/pdf-templates/letterhead/build-letterhead';
import type { LetterheadInput } from '../../../src/pdf-templates/letterhead/letterhead-input';

const INPUT: LetterheadInput = {
  language: 'en',
  organisationName: 'Example Council',
  mainColour: '#1D4ED8',
  accentColour: '#B91C1C',
  logoPosition: 'left',
  logoSrc: '/branding/logo.png',
  unit: { name: 'General Council', address: '1 Example Street\nLondon' },
  letter: {
    paragraphs: ['Dear colleague,', 'Body.'],
    signer: { name: 'Ada Example', role: 'Secretary', unit: 'General Council' },
  },
};

describe('the letterhead (D-081, D-082, D-089)', () => {
  it('puts the logo at the chosen place, a logical one that mirrors in Arabic', () => {
    expect(buildLetterhead(INPUT).bodyHtml).toContain('lh-logo-left');
    expect(buildLetterhead({ ...INPUT, logoPosition: 'centre' }).bodyHtml).toContain(
      'lh-logo-centre',
    );
    expect(buildLetterhead(INPUT).css).toContain('.lh-logo-left { flex-direction: row; }');
  });

  it('always shows the fixed logo (D-223)', () => {
    expect(buildLetterhead(INPUT).bodyHtml).toContain(
      '<img class="lh-logo" src="/branding/logo.png" alt="">',
    );
  });

  it('colours only the name and the rule; the text stays black', () => {
    const { bodyHtml, css } = buildLetterhead(INPUT);
    expect(bodyHtml).toContain('class="lh-org-name" style="color: #1D4ED8"');
    expect(bodyHtml).toContain('border-top-color: #B91C1C');
    expect(css).toContain('.lh { color: #000; background: #fff;');
  });

  it('shows a written letter’s reference, date and recipient before its subject, escaped (23 A2; D-214)', () => {
    const heading = {
      reference: 'Our reference: N/OUT/2026/001',
      date: 'Date: 1 May 2026',
      recipient: ['Ms <Example>', '1 Street'],
    };
    const html = buildLetterhead({
      ...INPUT,
      letter: { ...INPUT.letter, heading, subject: 'Thanks' },
    }).bodyHtml;
    expect(html).toContain('<p>Our reference: N/OUT/2026/001</p><p>Date: 1 May 2026</p>');
    expect(html).toContain('<p>Ms &lt;Example&gt;</p><p>1 Street</p>');
    expect(html.indexOf('lh-heading')).toBeLessThan(html.indexOf('lh-subject'));
    expect(buildLetterhead(INPUT).bodyHtml).not.toContain('lh-heading');
  });

  it('shows a subject, escaped and in bold, above the letter only when there is one (16 D1)', () => {
    const withSubject = buildLetterhead({
      ...INPUT,
      letter: { ...INPUT.letter, subject: 'Thanks <b>' },
    }).bodyHtml;
    expect(withSubject).toContain(
      '<main class="lh-body"><p class="lh-subject">Thanks &lt;b&gt;</p><p>Dear colleague,</p>',
    );
    expect(buildLetterhead(INPUT).bodyHtml).not.toContain('lh-subject');
    expect(buildLetterhead(INPUT).css).toContain('.lh-body p.lh-subject { font-weight: 700; }');
  });

  it('signs with name, role and unit and a space to sign — never an image', () => {
    const signature = buildLetterhead(INPUT).bodyHtml.split('lh-signature')[1] ?? '';
    expect(signature).toContain('lh-sign-space');
    expect(signature).toContain('Ada Example');
    expect(signature).not.toContain('<img');
  });

  it('escapes every value, and lets no colour carry anything but a colour', () => {
    const { bodyHtml } = buildLetterhead({
      ...INPUT,
      organisationName: '<script>alert(1)</script>',
      mainColour: 'red"><script>',
    });
    expect(bodyHtml).not.toContain('<script>');
    expect(bodyHtml).toContain('&lt;script&gt;');
    expect(bodyHtml).toContain('style="color: #000000"');
  });
});

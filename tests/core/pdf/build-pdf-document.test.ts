import { describe, expect, it } from 'vitest';
import { buildFontFaceCss, buildPdfDocument, type PdfFont } from '../../../src/worker/core/pdf';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

const FAKE_FONT: PdfFont = {
  family: 'Fixture Sans',
  data: toArrayBuffer(new TextEncoder().encode('not really a font')),
  format: 'truetype',
};

describe('buildFontFaceCss', () => {
  it('embeds each font as a data: URL, never a link to anywhere', () => {
    const css = buildFontFaceCss([FAKE_FONT]);

    expect(css).toContain('font-family: "Fixture Sans";');
    expect(css).toContain(
      `url(data:font/ttf;base64,${btoa('not really a font')}) format('truetype')`,
    );
    expect(css).not.toMatch(/https?:/);
  });

  it('keeps each font’s own weight and style', () => {
    const css = buildFontFaceCss([{ ...FAKE_FONT, weight: '700', style: 'italic' }]);

    expect(css).toContain('font-weight: 700;');
    expect(css).toContain('font-style: italic;');
  });

  it('encodes a font larger than one encoding chunk exactly', () => {
    const big = new Uint8Array(100_000).map((_, i) => i % 256);
    const css = buildFontFaceCss([{ ...FAKE_FONT, data: toArrayBuffer(big) }]);
    const encoded = /base64,([^)]+)\)/.exec(css)?.[1] ?? '';

    expect(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))).toEqual(big);
  });
});

describe('buildPdfDocument (brief section 9.4)', () => {
  const input = { bodyHtml: '<p>x</p>', css: 'p { color: black; }', fonts: [FAKE_FONT] };

  it('sets Arabic right-to-left on <html>', () => {
    expect(buildPdfDocument({ ...input, language: 'ar' })).toContain('<html lang="ar" dir="rtl">');
  });

  it('sets English left-to-right on <html>', () => {
    expect(buildPdfDocument({ ...input, language: 'en' })).toContain('<html lang="en" dir="ltr">');
  });

  it('puts the fonts before the stylesheet, and the body in <body>', () => {
    const html = buildPdfDocument({ ...input, language: 'en' });

    expect(html.indexOf('@font-face')).toBeLessThan(html.indexOf('p { color: black; }'));
    expect(html).toContain('<body><p>x</p></body>');
  });
});

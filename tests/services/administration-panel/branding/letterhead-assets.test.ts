import { describe, expect, it } from 'vitest';
import {
  LOGO_DATA_URL,
  letterheadFonts,
} from '../../../../src/worker/services/administration-panel/branding/letterhead-assets';

const leading = (data: ArrayBuffer, length: number) =>
  new TextDecoder('latin1').decode(data.slice(0, length));

describe('the fixed logo and fonts, bundled into every PDF (D-223)', () => {
  it('embeds the logo as a PNG', () => {
    expect(LOGO_DATA_URL).toMatch(/^data:image\/png;base64,iVBORw0KGgo/);
  });

  it('embeds the Latin and Arabic fonts as WOFF2, under the names the design uses', () => {
    const fonts = letterheadFonts();
    expect(fonts.map((f) => [f.family, f.format, leading(f.data, 4)])).toEqual([
      ['Portal Latin', 'woff2', 'wOF2'],
      ['Portal Arabic', 'woff2', 'wOF2'],
    ]);
  });
});

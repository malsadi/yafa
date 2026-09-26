import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fileTypeOf } from '../../../../../src/web/features/administration-panel/branding/font-type';
import { LogoPositionControl } from '../../../../../src/web/features/administration-panel/branding/logo-position-control';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

describe('branding controls (brief 25 C3; D-080, D-089)', () => {
  it('offers left, centre and right, says it mirrors in Arabic, and preselects nothing', async () => {
    setBrowserLanguages(['en-GB']);
    const onChange = vi.fn();
    const container = await renderForTest(
      <LogoPositionControl value={null} busy={false} onChange={onChange} />,
    );
    const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

    expect(radios.map((r) => r.parentElement?.textContent)).toEqual(['Left', 'Centre', 'Right']);
    expect(radios.some((r) => r.checked)).toBe(false);
    expect(container.textContent).toContain('mirrored');
    await act(async () => {
      radios[2]?.click();
      await Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledWith('right');
  });

  it('reads a font’s type from its extension when the browser sends none', () => {
    expect(fileTypeOf(new File(['x'], 'Amiri.WOFF2'))).toBe('font/woff2');
    expect(fileTypeOf(new File(['x'], 'serif.ttf'))).toBe('font/ttf');
    expect(fileTypeOf(new File(['x'], 'logo.png', { type: 'image/png' }))).toBe('image/png');
  });
});

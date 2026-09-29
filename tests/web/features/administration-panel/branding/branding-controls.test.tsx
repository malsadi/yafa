import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LogoPositionControl } from '../../../../../src/web/features/administration-panel/branding/logo-position-control';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

describe('branding controls (brief 25 C3; D-089)', () => {
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
});

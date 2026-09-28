import { describe, expect, it } from 'vitest';
import { ReferenceFormatInput } from '../../../../../src/web/features/administration-panel/setting-editor/reference-format-input';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const render = (draft: string) =>
  renderForTest(<ReferenceFormatInput label="Format" draft={draft} onChange={() => undefined} />);

describe('a reference number format on the settings screen (D-214, O-137)', () => {
  it('refuses a format without its year, before it is sent', async () => {
    setBrowserLanguages(['en-GB']);
    const screen = await render('{unit_code}/{number:3}');
    expect(screen.querySelector('[role="alert"]')?.textContent).toContain('must contain {year}');
    expect(screen.querySelector('input')?.validity.valid).toBe(false);
  });

  it('accepts a format with the year and one number', async () => {
    setBrowserLanguages(['en-GB']);
    const screen = await render('{unit_code}/OUT/{year}/{number:3}');
    expect(screen.querySelector('[role="alert"]')).toBeNull();
    expect(screen.querySelector('input')?.validity.valid).toBe(true);
  });
});

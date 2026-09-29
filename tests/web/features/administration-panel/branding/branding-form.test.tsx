import { describe, expect, it, vi } from 'vitest';
import { BrandingForm } from '../../../../../src/web/features/administration-panel/branding/branding-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const render = (mainColour: string) =>
  renderForTest(
    <BrandingForm
      branding={{
        organisationName: { en: 'Example Council', ar: null },
        mainColour,
        accentColour: '#B91C1C',
        logoPosition: null,
        letterheadUnit: null,
      }}
      busy={false}
      onSave={vi.fn()}
      onDraft={vi.fn()}
    />,
  );

describe('BrandingForm (brief 25 C3; D-082)', () => {
  it('shows each colour’s contrast against white, and saves only colours that read', async () => {
    setBrowserLanguages(['en-GB']);
    const good = await render('#1D4ED8');
    expect(good.textContent).toContain(':1 against white: reads well');
    expect(good.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);

    const pale = await render('#FACC15');
    expect(pale.textContent).toContain('too pale to read (needs 4.5:1)');
    expect(pale.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('says why Save waits when a colour is typed in another form (D-225)', async () => {
    setBrowserLanguages(['en-GB']);
    const typed = await render('1D4ED8');
    expect(typed.textContent).toContain('Type it as # and six letters or digits');
    expect(typed.textContent).toContain('Save becomes available once both colours are set');
    expect(typed.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    expect(typed.querySelectorAll('input[type="color"]')).toHaveLength(2);
  });
});

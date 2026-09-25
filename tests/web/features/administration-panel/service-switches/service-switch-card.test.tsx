import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NATIONAL_SCOPE } from '../../../../../src/shared/core/national-scope';
import { ServiceSwitchCard } from '../../../../../src/web/features/administration-panel/service-switches/service-switch-card';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const UNITS = [
  { id: 'u1', nameEn: 'North', nameAr: 'الشمال' },
  { id: 'u2', nameEn: 'South', nameAr: 'الجنوب' },
];

async function choose(select: HTMLSelectElement | null, value: string) {
  await act(async () => {
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    await Promise.resolve();
  });
}

describe('ServiceSwitchCard (brief 25 C2, 8.4)', () => {
  it('shows an always-on service as such, with nothing to switch', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ul>
        <ServiceSwitchCard
          service={{ slug: 'documents-archive', alwaysOn: true, needs: [] }}
          rows={[]}
          units={UNITS}
          refusal={null}
          busy={false}
          onChange={vi.fn()}
        />
      </ul>,
    );

    expect(container.textContent).toContain('Always on');
    expect(container.querySelector('select')).toBeNull();
  });

  it('shows what a service needs, switches it portal-wide, and returns a unit to portal-wide', async () => {
    setBrowserLanguages(['en-GB']);
    const onChange = vi.fn();
    const rows = [
      { service: 'event-organiser', scope: NATIONAL_SCOPE, enabled: false },
      { service: 'event-organiser', scope: 'u1', enabled: true },
    ];
    const container = await renderForTest(
      <ul>
        <ServiceSwitchCard
          service={{ slug: 'event-organiser', alwaysOn: false, needs: ['treasury'] }}
          rows={rows}
          units={UNITS}
          refusal={null}
          busy={false}
          onChange={onChange}
        />
      </ul>,
    );

    expect(container.textContent).toContain('Needs: Treasury');
    await choose(container.querySelector('[aria-label="Event organiser, portal-wide"]'), 'on');
    expect(onChange).toHaveBeenLastCalledWith(true);
    const north = container.querySelector<HTMLSelectElement>(
      '[aria-label="Event organiser for North"]',
    );
    expect(north?.value).toBe('on');
    await choose(north, 'follow');
    expect(onChange).toHaveBeenLastCalledWith(null, 'u1');
    const adding = container.querySelector<HTMLSelectElement>(
      '[aria-label="Give a unit its own on or off for Event organiser"]',
    );
    expect([...(adding?.options ?? [])].map((o) => o.textContent)).toEqual([
      'Choose a unit',
      'South',
    ]);
  });
});

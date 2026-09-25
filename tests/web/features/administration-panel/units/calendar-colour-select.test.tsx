import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { CalendarColourChoice } from '../../../../../src/shared/committee-register/unit-record';
import { CalendarColourSelect } from '../../../../../src/web/features/administration-panel/units/calendar-colour-select';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));

const colour = (id: string, nameEn: string, usedByUnitId: string | null): CalendarColourChoice => ({
  id,
  list: 'calendar-colours',
  nameEn,
  nameAr: nameEn,
  position: 1,
  retiredAt: null,
  colour: '#1D4ED8',
  usedByUnitId,
});

async function render(choices: CalendarColourChoice[], unitId: string | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(choices), { status: 200 }))),
  );
  setBrowserLanguages(['en-GB']);
  const container = await renderForTest(
    <QueryClientProvider client={new QueryClient()}>
      <CalendarColourSelect unitId={unitId} value="" onChange={vi.fn()} />
    </QueryClientProvider>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return container;
}

describe('CalendarColourSelect (D-076, D-078)', () => {
  it('shows a colour another unit uses as taken, and the unit’s own as free', async () => {
    const container = await render(
      [colour('blue', 'Blue', 'u-other'), colour('red', 'Red', 'u-me')],
      'u-me',
    );
    const options = [...container.querySelectorAll('option')];

    expect(options.find((o) => o.value === 'blue')?.disabled).toBe(true);
    expect(options.find((o) => o.value === 'blue')?.textContent).toBe(
      'Blue (used by another unit)',
    );
    expect(options.find((o) => o.value === 'red')?.disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('says to add another colour to the list when none is free', async () => {
    const container = await render([colour('blue', 'Blue', 'u-other')], null);

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Add another colour on the Lists screen',
    );
  });
});

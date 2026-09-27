import { describe, expect, it } from 'vitest';
import type { CalendarItem } from '../../../../src/shared/calendar/calendar-records';
import { CalendarMonthGrid } from '../../../../src/web/features/calendar/calendar-month-grid';
import { CalendarPeriodView } from '../../../../src/web/features/calendar/calendar-period-view';
import { draftOf, saveRequest } from '../../../../src/web/features/calendar/community-date-draft';
import {
  daysBetween,
  moveAnchor,
  periodFor,
} from '../../../../src/web/features/calendar/calendar-period';
import { itemsOnDay } from '../../../../src/web/features/calendar/items-on-day';
import {
  filtered,
  type CalendarState,
} from '../../../../src/web/features/calendar/use-calendar-state';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const FAIR: CalendarItem = {
  kind: 'community',
  id: 'c1',
  unitId: 'u1',
  unitNameEn: 'North',
  unitNameAr: 'الشمال',
  colour: '#123456',
  title: 'North fair',
  titleAr: null,
  startDate: '2026-10-30',
  endDate: '2026-11-02',
  startTime: null,
  description: null,
  forAllBranches: false,
  retiredAt: null,
  version: 2,
};
const MEETING: CalendarItem = {
  ...FAIR,
  kind: 'meeting',
  id: 'm1',
  unitId: 'u2',
  title: 'South committee',
  startDate: '2026-11-03',
  endDate: '2026-11-03',
  startTime: '19:00',
  version: null,
};
const noop = () => undefined;

describe('the Calendar screens (brief 19 B; D-145 to D-150)', () => {
  it('shows a month in whole weeks from Monday, a week from its Monday, and a list of the month', () => {
    expect(periodFor('month', '2026-11-15')).toEqual({ from: '2026-10-26', to: '2026-12-06' });
    expect(periodFor('week', '2026-11-15')).toEqual({ from: '2026-11-09', to: '2026-11-15' });
    expect(periodFor('list', '2026-02-10')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(moveAnchor('month', '2026-12-31', 1)).toBe('2027-01-01');
    expect(moveAnchor('week', '2026-11-09', -1)).toBe('2026-11-02');
    expect(daysBetween('2026-10-30', '2026-11-02')).toHaveLength(4);
  });

  it('puts a several-day date on each of its days', () => {
    expect(itemsOnDay([FAIR, MEETING], '2026-11-01')).toEqual([FAIR]);
    expect(itemsOnDay([FAIR, MEETING], '2026-11-03')).toEqual([MEETING]);
  });

  it('filters by kind, and by branch only across all branches (B3)', () => {
    const state = (scope: 'branch' | 'all', hiddenUnits: string[]) =>
      ({ scope, hiddenKinds: ['community'], hiddenUnits }) as unknown as CalendarState;
    expect(filtered([FAIR, MEETING], state('all', []))).toEqual([MEETING]);
    expect(filtered([FAIR, MEETING], state('all', ['u2']))).toEqual([]);
    expect(filtered([FAIR, MEETING], state('branch', ['u2']))).toEqual([MEETING]);
  });

  it('adds a one-day date with no time, and changes one from the version read (D-145, 9.1)', () => {
    const fresh = { ...draftOf(), title: 'Eid', startDate: '2026-12-01' };
    expect(saveRequest('u1', fresh)).toEqual({
      path: '/api/calendar/units/u1/community-dates',
      method: 'POST',
      body: {
        title: 'Eid',
        startDate: '2026-12-01',
        endDate: '2026-12-01',
        startTime: null,
        description: '',
        forAllBranches: false,
      },
    });
    expect(saveRequest('u1', draftOf(FAIR), FAIR)).toMatchObject({
      path: '/api/calendar/units/u1/community-dates/c1',
      method: 'PUT',
      body: { version: 2, date: { startDate: '2026-10-30', endDate: '2026-11-02' } },
    });
  });

  it('shows each item in its branch’s colour, with its time, and the branch across all branches (B2)', async () => {
    setBrowserLanguages(['en-GB']);
    const grid = await renderForTest(
      <CalendarMonthGrid
        period={{ from: '2026-11-02', to: '2026-11-08' }}
        items={[MEETING]}
        showUnit
        onChoose={noop}
      />,
    );
    const chip = grid.querySelector('button');
    expect(chip?.textContent).toContain('19:00South committee');
    expect(chip?.textContent).toContain('North');
    expect(chip?.getAttribute('style')).toContain('border-inline-start-color');
    expect(grid.querySelectorAll('[role="columnheader"]')[0]?.textContent).toBe('Mon');
  });

  it('says so when the list has nothing, in the officer’s language', async () => {
    setBrowserLanguages(['ar']);
    const list = await renderForTest(
      <CalendarPeriodView
        view="list"
        period={{ from: '2026-11-01', to: '2026-11-30' }}
        items={[]}
        showUnit={false}
        onChoose={noop}
      />,
    );
    expect(list.textContent).toBe('لا شيء في هذه الفترة.');
  });
});

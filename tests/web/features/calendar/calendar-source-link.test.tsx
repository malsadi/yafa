import { describe, expect, it } from 'vitest';
import type { CalendarItem } from '../../../../src/shared/calendar/calendar-records';
import { CalendarSourceLink } from '../../../../src/web/features/calendar/calendar-source-link';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const item = (kind: CalendarItem['kind'], unitId = 'u1') =>
  ({ kind, id: 'r1', unitId }) as CalendarItem;

describe('the Calendar links meetings and events to their own service (10.3)', () => {
  it('links the unit’s own meeting or event, never a community date or another unit’s', async () => {
    setBrowserLanguages(['en-GB']);
    const meeting = await renderForTest(<CalendarSourceLink item={item('meeting')} unitId="u1" />);
    expect(meeting.querySelector('a')?.getAttribute('href')).toBe('/meeting-recorder/meetings/r1');
    const event = await renderForTest(<CalendarSourceLink item={item('event')} unitId="u1" />);
    expect(event.querySelector('a')?.getAttribute('href')).toBe('/event-organiser/events/r1');
    expect(
      (await renderForTest(<CalendarSourceLink item={item('community')} unitId="u1" />)).innerHTML,
    ).toBe('');
    expect(
      (await renderForTest(<CalendarSourceLink item={item('event', 'u2')} unitId="u1" />))
        .innerHTML,
    ).toBe('');
  });
});

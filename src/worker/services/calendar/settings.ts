import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 5's setting (brief 19; 8.1: no default): whether the phone feed
 * includes the General Council's community dates for all branches (D-148).
 * Required before the Calendar is switched on (15 C6). Each branch's colour
 * is set on the unit (25 B1, D-076).
 */
export function registerCalendarSettings(): void {
  registerSetting({
    key: 'calendar.feed_includes_all_branch_dates',
    label: 'Phone feed includes all-branches community dates',
    description:
      "Whether the phone calendar feed includes the General Council's community dates for all branches (19 C1; D-148).",
    schema: z.boolean(),
    required: true,
    unitOverrideAllowed: false,
  });
}

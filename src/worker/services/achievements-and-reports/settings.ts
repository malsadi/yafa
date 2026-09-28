import { z } from 'zod';
import { isFixedDayOfYear } from '../../../shared/treasury/financial-year';
import { registerSetting } from '../../core/settings';

/**
 * Service 12's setting (brief 24; 8.1: no default in code): the day and
 * month each annual report's year begins (D-215, O-154). Portal-wide, and a
 * unit may have its own. Achievement categories are the list in 15 B3.
 * Required before the service is switched on.
 */
export function registerAchievementsAndReportsSettings(): void {
  registerSetting({
    key: 'achievements-and-reports.report_year_start',
    label: 'Annual report year start',
    description:
      'The day and month each annual report’s year begins; the "2026" report covers the 12 months from that day in 2026 (24 settings; D-215).',
    schema: z
      .object({ month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) })
      .refine(isFixedDayOfYear, { message: 'A day every year has.' }),
    input: { kind: 'day-and-month' },
    required: true,
    unitOverrideAllowed: true,
  });
}

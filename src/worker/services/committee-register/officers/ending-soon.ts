import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import type {
  CurrentOfficerRecord,
  OfficerRecord,
} from '../../../../shared/committee-register/officer-record';
import { getSetting } from '../../../core/settings';

const WINDOW = 'committee-register.terms_ending_soon_window_days';

/**
 * Brief 14 B3: marks each term ending within the window set by the data
 * administrator — on or before today plus that many days. While the
 * window is not set, every mark is null, so the register can say so (T-100).
 */
export async function markEndingSoon(
  db: D1Database,
  officers: OfficerRecord[],
  today: string,
): Promise<CurrentOfficerRecord[]> {
  const window = await getSetting<number>(db, WINDOW);
  const cutoff = window.status === 'configured' ? addDaysToDate(today, window.value) : null;
  return officers.map((officer) => ({
    ...officer,
    endingSoon: cutoff === null ? null : officer.endDate !== null && officer.endDate <= cutoff,
  }));
}

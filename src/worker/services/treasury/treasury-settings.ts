import type { DayAndMonth } from '../../../shared/treasury/financial-year';
import { ServiceUnavailableError } from '../../core/errors';
import { getSetting } from '../../core/settings';

async function requireSetting<Value>(db: D1Database, key: string, unitId: string): Promise<Value> {
  const setting = await getSetting<Value>(db, key, unitId);
  if (setting.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  return setting.value;
}

/** Brief 17 B5: the unit's approval threshold, in pence; a refusal while not set (8.1). */
export function approvalThreshold(db: D1Database, unitId: string): Promise<number> {
  return requireSetting<number>(db, 'treasury.approval_threshold', unitId);
}

/** Brief 17 C3: the day and month the unit's financial year starts (D-128). */
export function financialYearStart(db: D1Database, unitId: string): Promise<DayAndMonth> {
  return requireSetting<DayAndMonth>(db, 'treasury.financial_year_start', unitId);
}

/** Brief 17 B4: whether a credit or debit needs a receipt photo to be saved (D-123). */
export function receiptRequired(db: D1Database, unitId: string): Promise<boolean> {
  return requireSetting<boolean>(db, 'treasury.receipt_required', unitId);
}

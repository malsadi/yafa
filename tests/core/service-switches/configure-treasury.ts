import { getSettingDefinition, setSetting } from '../../../src/worker/core/settings';
import { registerTreasurySettings } from '../../../src/worker/services/treasury';

/**
 * The Treasury's required settings (brief 17), so it can be switched on
 * (15 C6) where a test uses it as its example of a switchable service.
 */
export async function configureTreasury(db: D1Database, actorPersonId: string): Promise<void> {
  if (!getSettingDefinition('treasury.approval_threshold')) registerTreasurySettings();
  for (const [key, value] of [
    ['treasury.approval_threshold', 10000],
    ['treasury.financial_year_start', { month: 4, day: 1 }],
    ['treasury.receipt_required', false],
  ] as const) {
    await setSetting(db, { key, value, actorPersonId });
  }
}

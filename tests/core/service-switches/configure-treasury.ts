import { getSettingDefinition, setSetting } from '../../../src/worker/core/settings';
import { registerTaskTrackerSettings } from '../../../src/worker/services/task-tracker';
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

/** The Task tracker's required settings (brief 18), where a test switches it on as an example. */
export async function configureTaskTracker(db: D1Database, actorPersonId: string): Promise<void> {
  if (!getSettingDefinition('task-tracker.due_soon_window_days')) registerTaskTrackerSettings();
  await setSetting(db, { key: 'task-tracker.due_soon_window_days', value: 7, actorPersonId });
  await setSetting(db, { key: 'task-tracker.reminder_days_before', value: 3, actorPersonId });
}

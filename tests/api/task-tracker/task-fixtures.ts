import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { buildTestApp } from '../../app/app-fixtures';

export { call } from '../documents-archive/archive-fixtures';
export {
  colleagueOf,
  treasuryOfficer as taskOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const unitTasks = (unitId: string) => `/api/task-tracker/units/${unitId}`;

/** Switch the Task tracker on for a unit, and set its settings (18; 8.4). */
export async function readyTaskTracker(
  unitId: string,
  actor: string,
  windowDays = 7,
  reminderDays = 3,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('task-tracker', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
  await buildTestApp();
  await setSetting(env.DB, {
    key: 'task-tracker.due_soon_window_days',
    value: windowDays,
    actorPersonId: actor,
  });
  await setSetting(env.DB, {
    key: 'task-tracker.reminder_days_before',
    value: reminderDays,
    actorPersonId: actor,
  });
}

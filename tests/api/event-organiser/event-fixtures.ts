import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { buildTestApp } from '../../app/app-fixtures';
import { readyTaskTracker } from '../task-tracker/task-fixtures';
import { readyTreasury } from '../treasury/treasury-fixtures';

export { call } from '../documents-archive/archive-fixtures';
export {
  colleagueOf,
  treasuryOfficer as eventOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const unitEvents = (unitId: string) => `/api/event-organiser/units/${unitId}`;

export const READ = 'event-organiser.events.read';
export const CREATE = 'event-organiser.events.create';
export const APPROVE = 'event-organiser.events.approve';
export const MANAGE = 'event-organiser.events.manage';
export const CLOSE = 'event-organiser.events.close';
export const TEMPLATES = 'event-organiser.templates.manage';

/**
 * Switch the Event organiser on for a unit with the two services it needs
 * (D-186), and set its settings and theirs (21; 8.4).
 */
export async function readyEvents(
  unitId: string,
  actor: string,
  settings: { backwards: boolean; cancelledCount: boolean } = {
    backwards: false,
    cancelledCount: false,
  },
): Promise<void> {
  await readyTreasury(unitId, { thresholdPence: 50000, receiptRequired: false, actor });
  await readyTaskTracker(unitId, actor);
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('event-organiser', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
  await buildTestApp();
  await setSetting(env.DB, {
    key: 'event-organiser.status_may_move_backwards',
    value: settings.backwards,
    actorPersonId: actor,
  });
  await setSetting(env.DB, {
    key: 'event-organiser.cancelled_tasks_count_in_progress',
    value: settings.cancelledCount,
    actorPersonId: actor,
  });
}

/** A fictional event type in the data administrator's list (15 B3). */
export async function addEventType(id: string, nameEn: string, retired = false): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at)
     VALUES (?, 'event-types', ?, ?, 1, ?, NULL, 'now')`,
  )
    .bind(id, nameEn, `${nameEn} (ar)`, retired ? 'then' : null)
    .run();
}

/** An event's details, as the form sends them (D-172). */
export const eventBody = (params: {
  name: string;
  typeItemId: string;
  leadPersonId: string;
  firstDay?: string;
  lastDay?: string | null;
}) => ({
  name: params.name,
  typeItemId: params.typeItemId,
  leadPersonId: params.leadPersonId,
  firstDay: params.firstDay ?? '2099-06-20',
  startTime: '18:00',
  lastDay: params.lastDay ?? null,
});

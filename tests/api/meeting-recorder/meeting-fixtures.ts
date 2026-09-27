import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { buildTestApp } from '../../app/app-fixtures';

export { call } from '../documents-archive/archive-fixtures';
export {
  colleagueOf,
  treasuryOfficer as meetingOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const READ = 'meeting-recorder.meetings.read';
export const MANAGE = 'meeting-recorder.meetings.manage';
export const unitMeetings = (unitId: string) => `/api/meeting-recorder/units/${unitId}`;

/** Switch a service on or off for a unit (8.4). */
export async function switchService(service: string, unitId: string, enabled: boolean) {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES (?, ?, ?, ?, 'test')
     ON CONFLICT DO UPDATE SET enabled = excluded.enabled`,
  )
    .bind(service, unitId, enabled ? 1 : 0, new Date().toISOString())
    .run();
  await buildTestApp();
}

/** The Meeting recorder on for the unit, with its targets as asked, and the autosave interval set (D-207). */
export async function readyMeetings(
  unitId: string,
  actor: string,
  targets: { calendar: boolean; hub: boolean } = { calendar: true, hub: true },
) {
  await switchService('meeting-recorder', unitId, true);
  await switchService('calendar', unitId, targets.calendar);
  await switchService('communication-hub', unitId, targets.hub);
  await setSetting(env.DB, {
    key: 'meeting-recorder.minutes_autosave_seconds',
    value: 20,
    actorPersonId: actor,
  });
}

/** A fictional meeting type in the data administrator's list (15 B3). */
export async function addMeetingType(id: string, nameEn: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at)
     VALUES (?, 'meeting-types', ?, ?, 1, NULL, NULL, 'now')`,
  )
    .bind(id, nameEn, `${nameEn} (ar)`)
    .run();
}

/** A meeting's details, as the form sends them (D-198). */
export const meetingBody = (p: {
  typeItemId: string;
  chair: string;
  secretary: string;
  date?: string;
}) => ({
  typeItemId: p.typeItemId,
  date: p.date ?? '2099-03-10',
  startTime: '19:00',
  place: 'Fictional hall (test)',
  onlineLink: null,
  chairPersonId: p.chair,
  secretaryPersonId: p.secretary,
});

/** The automatic posts made for a meeting (brief 22: only two, ever). */
export const hubPosts = async (meetingId: string) =>
  (
    await env.DB.prepare(
      "SELECT automatic_kind AS kind FROM notices WHERE source = 'automatic' AND source_record_id = ? ORDER BY created_at",
    )
      .bind(meetingId)
      .all<{ kind: string }>()
  ).results.map((r) => r.kind);

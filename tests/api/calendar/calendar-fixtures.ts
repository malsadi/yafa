import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { buildCalendarEntryStatement } from '../../../src/worker/services/calendar';
import { buildTestApp } from '../../app/app-fixtures';

export { call } from '../documents-archive/archive-fixtures';
export { treasuryOfficer as calendarOfficer, type Officer } from '../treasury/treasury-fixtures';

export const unitCalendar = (unitId: string) => `/api/calendar/units/${unitId}`;

/** Switch the Calendar on for a unit (8.4), and set whether the feed includes all-branches dates (D-148). */
export async function readyCalendar(
  unitId: string,
  actor: string,
  allBranchDatesInFeed: boolean,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('calendar', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
  await buildTestApp();
  await setSetting(env.DB, {
    key: 'calendar.feed_includes_all_branch_dates',
    value: allBranchDatesInFeed,
    actorPersonId: actor,
  });
}

/** A meeting as the Meeting recorder will write it into the read-model (Phase 9). */
export async function scheduleMeeting(
  unitId: string,
  id: string,
  title: string,
  date: string,
  startTime: string | null = null,
) {
  await env.DB.batch([
    buildCalendarEntryStatement(env.DB, {
      unitId,
      kind: 'meeting',
      sourceRecordId: id,
      title,
      titleAr: null,
      date,
      lastDate: null,
      startTime,
    }),
  ]);
}

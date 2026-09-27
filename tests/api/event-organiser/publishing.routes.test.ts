import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventSummary } from '../../../src/shared/event-organiser/event-records';
import { buildTestApp, insertNoticeVersion } from '../../app/app-fixtures';
import {
  addEventType,
  APPROVE,
  call,
  colleagueOf,
  CREATE,
  eventBody,
  eventOfficer,
  MANAGE,
  READ,
  readyEvents,
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EPNTV';
const TYPE = 'type-EP-gala';
let manager: Officer;
let approver: Officer;

const path = (id: string, action = '') => `${unitEvents(manager.unitId)}/events/${id}${action}`;
const read = async (id: string) =>
  (await call(manager.clerkUserId, 'GET', path(id))).json<EventSummary>();
const publish = async (id: string, targets: string[]) =>
  call(manager.clerkUserId, 'POST', path(id, '/publish'), {
    targets,
    version: (await read(id)).version,
  });
const calendarRows = (id: string) =>
  env.DB.prepare(
    "SELECT title, date FROM calendar_entries WHERE kind = 'event' AND source_record_id = ?",
  )
    .bind(id)
    .all();
const autoPosts = (id: string) =>
  env.DB.prepare(
    "SELECT title FROM notices WHERE source = 'automatic' AND automatic_kind = 'event-published' AND source_record_id = ?",
  )
    .bind(id)
    .all();

async function switchService(service: string, enabled: boolean) {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES (?, ?, ?, ?, 'test')
     ON CONFLICT DO UPDATE SET enabled = excluded.enabled`,
  )
    .bind(service, manager.unitId, enabled ? 1 : 0, new Date().toISOString())
    .run();
  await buildTestApp();
}

async function event(name: string, approve = true): Promise<string> {
  const created = await call(manager.clerkUserId, 'POST', `${unitEvents(manager.unitId)}/events`, {
    event: eventBody({ name, typeItemId: TYPE, leadPersonId: manager.personId }),
    templateId: null,
  });
  const { id } = await created.json<{ id: string }>();
  if (approve) await call(approver.clerkUserId, 'POST', path(id, '/approve'), { version: 1 });
  return id;
}

describe('publishing an event: Calendar and Noticeboard, once each (brief 21 B4; 10.1; D-182, D-186)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await eventOfficer({
      suffix: 'EP1',
      notice: NOTICE,
      capabilities: [READ, CREATE, MANAGE],
    });
    approver = await colleagueOf(manager, {
      suffix: 'EP2',
      notice: NOTICE,
      capabilities: [APPROVE],
    });
    await readyEvents(manager.unitId, manager.personId);
    await addEventType(TYPE, 'Gala');
  });

  it('is refused for a draft', async () => {
    expect((await publish(await event('Draft gala', false), ['calendar'])).status).toBe(409);
  });

  it('publishes to both in one batch, once each; the Calendar follows later changes', async () => {
    await switchService('calendar', true);
    await switchService('communication-hub', true);
    const id = await event('Spring gala');
    const res = await publish(id, ['calendar', 'noticeboard']);
    expect(await res.json()).toEqual({ published: ['calendar', 'noticeboard'], skipped: [] });
    expect((await calendarRows(id)).results).toEqual([
      { title: 'Spring gala', date: '2099-06-20' },
    ]);
    expect((await autoPosts(id)).results).toHaveLength(1);
    expect(await (await publish(id, ['calendar', 'noticeboard'])).json()).toEqual({
      published: [],
      skipped: [],
    });
    expect((await autoPosts(id)).results).toHaveLength(1);
    const renamed = eventBody({
      name: 'Spring gala 2099',
      typeItemId: TYPE,
      leadPersonId: manager.personId,
    });
    await call(manager.clerkUserId, 'PUT', path(id), {
      event: renamed,
      version: (await read(id)).version,
    });
    expect((await calendarRows(id)).results).toEqual([
      { title: 'Spring gala 2099', date: '2099-06-20' },
    ]);
    expect((await autoPosts(id)).results).toHaveLength(1);
  });

  it('skips a target whose service is off, and publishes to it once it is back on', async () => {
    await switchService('calendar', false);
    const id = await event('Autumn gala');
    expect(await (await publish(id, ['calendar', 'noticeboard'])).json()).toEqual({
      published: ['noticeboard'],
      skipped: ['calendar'],
    });
    expect((await calendarRows(id)).results).toEqual([]);
    await switchService('calendar', true);
    expect(await (await publish(id, ['calendar'])).json()).toEqual({
      published: ['calendar'],
      skipped: [],
    });
    const after = await read(id);
    expect([after.calendarPublishedAt !== null, after.noticeboardPublishedAt !== null]).toEqual([
      true,
      true,
    ]);
  });

  it('records each publication once, in the database too', async () => {
    const id = await event('Winter gala');
    await publish(id, ['calendar']);
    await expect(
      env.DB.prepare(
        'UPDATE events SET calendar_published_at = NULL, version = version + 1 WHERE id = ?',
      )
        .bind(id)
        .run(),
    ).rejects.toThrow();
  });

  it('shows an event over several days on each day in the Calendar (D-189)', async () => {
    const created = await call(
      manager.clerkUserId,
      'POST',
      `${unitEvents(manager.unitId)}/events`,
      {
        event: eventBody({
          name: 'Camp',
          typeItemId: TYPE,
          leadPersonId: manager.personId,
          firstDay: '2099-08-01',
          lastDay: '2099-08-03',
        }),
        templateId: null,
      },
    );
    const { id } = await created.json<{ id: string }>();
    await call(approver.clerkUserId, 'POST', path(id, '/approve'), { version: 1 });
    await publish(id, ['calendar']);
    const row = await env.DB.prepare(
      "SELECT date, last_date AS lastDate FROM calendar_entries WHERE kind = 'event' AND source_record_id = ?",
    )
      .bind(id)
      .first();
    expect(row).toEqual({ date: '2099-08-01', lastDate: '2099-08-03' });
  });

  it('when cancelled, leaves the Calendar and gets a new "cancelled" post; the announcement stays (D-190)', async () => {
    const id = await event('Summer gala');
    await publish(id, ['calendar', 'noticeboard']);
    const cancel = await call(manager.clerkUserId, 'POST', path(id, '/cancel'), {
      reason: 'Venue flooded',
      version: (await read(id)).version,
    });
    expect(cancel.status).toBe(204);
    expect((await calendarRows(id)).results).toEqual([]);
    const posts = await env.DB.prepare(
      'SELECT automatic_kind AS kind, title FROM notices WHERE source_record_id = ? ORDER BY automatic_kind DESC',
    )
      .bind(id)
      .all();
    expect(posts.results).toEqual([
      { kind: 'event-published', title: 'Summer gala' },
      { kind: 'event-cancelled', title: 'Summer gala' },
    ]);
    expect((await publish(id, ['calendar'])).status).toBe(409);
  });

  it('with the hub off, skips the "cancelled" post, and makes it once the hub is back on', async () => {
    const id = await event('Harvest gala');
    await publish(id, ['noticeboard']);
    await switchService('communication-hub', false);
    await call(manager.clerkUserId, 'POST', path(id, '/cancel'), {
      reason: 'Rain',
      version: (await read(id)).version,
    });
    expect((await read(id)).cancellationPostedAt).toBeNull();
    await switchService('communication-hub', true);
    expect((await call(manager.clerkUserId, 'POST', path(id, '/post-cancellation'))).status).toBe(
      204,
    );
    expect((await read(id)).cancellationPostedAt).not.toBeNull();
    expect((await call(manager.clerkUserId, 'POST', path(id, '/post-cancellation'))).status).toBe(
      409,
    );
  });
});

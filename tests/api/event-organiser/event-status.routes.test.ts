import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventSummary } from '../../../src/shared/event-organiser/event-records';
import { setSetting } from '../../../src/worker/core/settings';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  addEventType,
  APPROVE,
  call,
  colleagueOf,
  CREATE,
  eventBody,
  eventOfficer,
  READ,
  readyEvents,
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ESNTV';
const TYPE = 'type-ES-talk';
let creator: Officer;
let lead: Officer;
let bystander: Officer;

const path = (id: string, action = '') => `${unitEvents(creator.unitId)}/events/${id}${action}`;
const read = async (id: string) =>
  (await call(creator.clerkUserId, 'GET', path(id))).json<EventSummary>();
const move = async (o: Officer, id: string, to: string) =>
  call(o.clerkUserId, 'POST', path(id, '/status'), { to, version: (await read(id)).version });
const cancel = async (o: Officer, id: string, reason: string) =>
  call(o.clerkUserId, 'POST', path(id, '/cancel'), { reason, version: (await read(id)).version });

async function approvedEvent(name: string): Promise<string> {
  const created = await call(creator.clerkUserId, 'POST', `${unitEvents(creator.unitId)}/events`, {
    event: eventBody({ name, typeItemId: TYPE, leadPersonId: lead.personId }),
    templateId: null,
  });
  const { id } = await created.json<{ id: string }>();
  await call(lead.clerkUserId, 'POST', path(id, '/approve'), { version: 1 });
  return id;
}

describe('event status: moved by the lead officer, cancelled with a reason (D-174, D-180, D-181)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    creator = await eventOfficer({ suffix: 'ES1', notice: NOTICE, capabilities: [READ, CREATE] });
    lead = await colleagueOf(creator, {
      suffix: 'ES2',
      notice: NOTICE,
      capabilities: [READ, APPROVE],
    });
    bystander = await colleagueOf(creator, { suffix: 'ES3', notice: NOTICE, capabilities: [READ] });
    await readyEvents(creator.unitId, creator.personId);
    await addEventType(TYPE, 'Talk');
  });

  it('moves forward one step at a time, by its lead officer only', async () => {
    const id = await approvedEvent('Talk one');
    expect((await move(bystander, id, 'In preparation')).status).toBe(403);
    expect((await move(lead, id, 'Ready')).status).toBe(409);
    for (const to of ['In preparation', 'Ready', 'Completed'])
      expect((await move(lead, id, to)).status).toBe(204);
    expect((await read(id)).status).toBe('Completed');
  });

  it('moves back one step only where the setting allows, never to Draft', async () => {
    const id = await approvedEvent('Talk two');
    await move(lead, id, 'In preparation');
    expect((await move(lead, id, 'Approved')).status).toBe(409);
    await setSetting(env.DB, {
      key: 'event-organiser.status_may_move_backwards',
      value: true,
      actorPersonId: creator.personId,
    });
    expect((await move(lead, id, 'Approved')).status).toBe(204);
    expect((await move(lead, id, 'Draft')).status).toBe(400);
    await setSetting(env.DB, {
      key: 'event-organiser.status_may_move_backwards',
      value: false,
      actorPersonId: creator.personId,
    });
  });

  it('is cancelled from any status before Closed, with a reason, for good', async () => {
    const draft = await (
      await call(creator.clerkUserId, 'POST', `${unitEvents(creator.unitId)}/events`, {
        event: eventBody({ name: 'Talk three', typeItemId: TYPE, leadPersonId: lead.personId }),
        templateId: null,
      })
    ).json<{ id: string }>();
    expect((await cancel(lead, draft.id, '')).status).toBe(400);
    expect((await cancel(bystander, draft.id, 'Speaker ill')).status).toBe(403);
    expect((await cancel(lead, draft.id, 'Speaker ill')).status).toBe(204);
    const cancelled = await read(draft.id);
    expect([cancelled.status, cancelled.cancelReason]).toEqual(['Cancelled', 'Speaker ill']);
    expect((await cancel(lead, draft.id, 'Again')).status).toBe(409);
    expect((await move(lead, draft.id, 'Approved')).status).toBe(409);
    await expect(
      env.DB.prepare("UPDATE events SET status = 'Ready', version = version + 1 WHERE id = ?")
        .bind(draft.id)
        .run(),
    ).rejects.toThrow();
  });
});

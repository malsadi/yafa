import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventSummary } from '../../../src/shared/event-organiser/event-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
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
  TEMPLATES,
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EVNTV';
const TYPE = 'type-EV-fete';
let creator: Officer;
let approver: Officer;
let reader: Officer;
let outsider: Officer;
let eventId = '';

const get = async (o: Officer) =>
  (
    await call(o.clerkUserId, 'GET', `${unitEvents(creator.unitId)}/events/${eventId}`)
  ).json<EventSummary>();

describe('events: created from a template, approved by a second officer (brief 21 A1 to A4)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    creator = await eventOfficer({
      suffix: 'EV1',
      notice: NOTICE,
      capabilities: [READ, CREATE, MANAGE, APPROVE, TEMPLATES],
    });
    approver = await colleagueOf(creator, {
      suffix: 'EV2',
      notice: NOTICE,
      capabilities: [READ, APPROVE],
    });
    reader = await colleagueOf(creator, { suffix: 'EV3', notice: NOTICE, capabilities: [READ] });
    outsider = await eventOfficer({ suffix: 'EV4', notice: NOTICE, capabilities: [READ, CREATE] });
    await readyEvents(creator.unitId, creator.personId);
    await readyEvents(outsider.unitId, outsider.personId);
    await addEventType(TYPE, 'Summer fete');
    await addEventType('type-EV-old', 'Old type', true);
  });

  it('starts from a template: account with budget lines, and tasks due before the first day (A1, A3, 10.1)', async () => {
    const template = await call(
      creator.clerkUserId,
      'POST',
      `${unitEvents(creator.unitId)}/templates`,
      {
        name: 'Fete',
        tasks: [
          { title: 'Book the hall', description: null, daysBefore: 30 },
          { title: 'Print flyers', description: 'A5', daysBefore: 7 },
        ],
        budgetLines: [
          { name: 'Hall hire', amountPence: 20000 },
          { name: 'Printing', amountPence: 5000 },
        ],
      },
    );
    const { id: templateId } = await template.json<{ id: string }>();
    const created = await call(
      creator.clerkUserId,
      'POST',
      `${unitEvents(creator.unitId)}/events`,
      {
        event: eventBody({ name: 'Summer fete', typeItemId: TYPE, leadPersonId: reader.personId }),
        templateId,
      },
    );
    expect(created.status).toBe(201);
    eventId = (await created.json<{ id: string }>()).id;
    const tasks = await env.DB.prepare(
      'SELECT title, owner_person_id AS owner, due_date AS due, status FROM tasks WHERE event_id = ? ORDER BY due_date',
    )
      .bind(eventId)
      .all();
    expect(tasks.results).toEqual([
      { title: 'Book the hall', owner: reader.personId, due: '2099-05-21', status: 'To do' },
      { title: 'Print flyers', owner: reader.personId, due: '2099-06-13', status: 'To do' },
    ]);
    const lines = await env.DB.prepare(
      `SELECT b.name, b.amount_pence AS pence FROM treasury_budget_lines b
       JOIN treasury_accounts a ON a.id = b.account_id WHERE a.event_id = ? AND a.kind = 'event' ORDER BY b.position`,
    )
      .bind(eventId)
      .all();
    expect(lines.results).toEqual([
      { name: 'Hall hire', pence: 20000 },
      { name: 'Printing', pence: 5000 },
    ]);
    expect((await get(reader)).status).toBe('Draft');
  });

  it('refuses a retired type, a lead who is not an officer, or no permission', async () => {
    const path = `${unitEvents(creator.unitId)}/events`;
    const body = (typeItemId: string, leadPersonId: string) => ({
      event: eventBody({ name: 'X', typeItemId, leadPersonId }),
      templateId: null,
    });
    expect(
      (await call(creator.clerkUserId, 'POST', path, body('type-EV-old', creator.personId))).status,
    ).toBe(409);
    expect(
      (await call(creator.clerkUserId, 'POST', path, body(TYPE, outsider.personId))).status,
    ).toBe(409);
    expect(
      (await call(reader.clerkUserId, 'POST', path, body(TYPE, creator.personId))).status,
    ).toBe(403);
  });

  it('is approved by a second officer only, once (A4; D-175)', async () => {
    const approve = (o: Officer, version: number) =>
      call(o.clerkUserId, 'POST', `${unitEvents(creator.unitId)}/events/${eventId}/approve`, {
        version,
      });
    expect(await (await approve(creator, 1)).json()).toEqual({
      error: { code: 'event-organiser.own-event' },
    });
    expect((await approve(reader, 1)).status).toBe(403);
    expect((await approve(approver, 1)).status).toBe(204);
    expect((await get(reader)).status).toBe('Approved');
    expect((await approve(approver, 2)).status).toBe(409);
  });

  it('changes its details from the version read, never a stale one (D-176; 9.1)', async () => {
    const save = (version: number) =>
      call(creator.clerkUserId, 'PUT', `${unitEvents(creator.unitId)}/events/${eventId}`, {
        event: eventBody({
          name: 'Summer fete 2099',
          typeItemId: TYPE,
          leadPersonId: reader.personId,
        }),
        version,
      });
    expect((await save(2)).status).toBe(204);
    expect((await get(reader)).name).toBe('Summer fete 2099');
    expect((await save(2)).status).toBe(409);
  });

  it("is seen by its own unit's officers only (D-173)", async () => {
    expect(
      (await call(outsider.clerkUserId, 'GET', `${unitEvents(creator.unitId)}/events`)).status,
    ).toBe(403);
    const own = await call(outsider.clerkUserId, 'GET', `${unitEvents(outsider.unitId)}/events`);
    expect(await own.json()).toEqual([]);
  });

  it('is never deleted, and the database refuses a self-approval (D-175)', async () => {
    await expect(
      env.DB.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run(),
    ).rejects.toThrow();
    await expect(
      env.DB.prepare(
        'UPDATE events SET approved_by = created_by, version = version + 1 WHERE id = ?',
      )
        .bind(eventId)
        .run(),
    ).rejects.toThrow();
  });
});

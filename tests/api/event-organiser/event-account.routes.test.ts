import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventSummary } from '../../../src/shared/event-organiser/event-records';
import type { AccountHistory } from '../../../src/shared/treasury/treasury-records';
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
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EANTV';
const TYPE = 'type-EA-dinner';
let manager: Officer;
let approver: Officer;
let eventId = '';

const path = (action = '') => `${unitEvents(manager.unitId)}/events/${eventId}${action}`;
const account = async () =>
  (await call(approver.clerkUserId, 'GET', path('/account'))).json<AccountHistory>();
const read = async () => (await call(manager.clerkUserId, 'GET', path())).json<EventSummary>();

describe("the event's account: budget lines in Draft, name following the event (21 A2; D-176, D-177, D-187, D-188)", () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await eventOfficer({
      suffix: 'EA1',
      notice: NOTICE,
      capabilities: [READ, CREATE, MANAGE],
    });
    approver = await colleagueOf(manager, {
      suffix: 'EA2',
      notice: NOTICE,
      capabilities: [READ, APPROVE],
    });
    await readyEvents(manager.unitId, manager.personId);
    await addEventType(TYPE, 'Dinner');
    const created = await call(
      manager.clerkUserId,
      'POST',
      `${unitEvents(manager.unitId)}/events`,
      {
        event: eventBody({
          name: 'Annual dinner',
          typeItemId: TYPE,
          leadPersonId: manager.personId,
        }),
        templateId: null,
      },
    );
    eventId = (await created.json<{ id: string }>()).id;
  });

  it('adds, changes and removes budget lines while in Draft', async () => {
    for (const name of ['Venue', 'Food', 'Music'])
      expect(
        (
          await call(manager.clerkUserId, 'POST', path('/budget-lines'), {
            name,
            amountPence: 1000,
          })
        ).status,
      ).toBe(201);
    const [venue, food] = (await account()).budgetLines;
    expect(
      (
        await call(manager.clerkUserId, 'PUT', path(`/budget-lines/${venue?.id ?? ''}`), {
          name: 'Venue hire',
          amountPence: 25000,
        })
      ).status,
    ).toBe(204);
    expect(
      (await call(manager.clerkUserId, 'POST', path(`/budget-lines/${food?.id ?? ''}/remove`)))
        .status,
    ).toBe(204);
    expect((await account()).budgetLines.map((l) => [l.name, l.amountPence])).toEqual([
      ['Venue hire', 25000],
      ['Music', 1000],
    ]);
  });

  it('never removes a line an entry is tagged to', async () => {
    const [venue] = (await account()).budgetLines;
    const { account: acc } = await account();
    await env.DB.prepare(
      `INSERT INTO treasury_entries (id, unit_id, type, account_id, to_account_id, amount_pence, entry_date, counterparty,
         description, budget_line_id, approval_status, reverses_entry_id, created_by, created_at)
       VALUES ('entry-EA', ?, 'credit', ?, NULL, 500, '2026-06-01', 'Donor', NULL, ?, 'Not needed', NULL, ?, 'now')`,
    )
      .bind(manager.unitId, acc.id, venue?.id, manager.personId)
      .run();
    expect(
      await (
        await call(manager.clerkUserId, 'POST', path(`/budget-lines/${venue?.id ?? ''}/remove`))
      ).json(),
    ).toEqual({
      error: { code: 'event-organiser.budget-line-tagged' },
    });
    await expect(
      env.DB.prepare('DELETE FROM treasury_budget_lines WHERE id = ?').bind(venue?.id).run(),
    ).rejects.toThrow();
  });

  it('keeps the account named as the event', async () => {
    const renamed = eventBody({
      name: 'Gala dinner',
      typeItemId: TYPE,
      leadPersonId: manager.personId,
    });
    expect(
      (
        await call(manager.clerkUserId, 'PUT', path(), {
          event: renamed,
          version: (await read()).version,
        })
      ).status,
    ).toBe(204);
    expect((await account()).account.name).toBe('Gala dinner');
  });

  it('fixes the budget once approved, in the service and the database', async () => {
    await call(approver.clerkUserId, 'POST', path('/approve'), { version: (await read()).version });
    expect(
      await (
        await call(manager.clerkUserId, 'POST', path('/budget-lines'), {
          name: 'Late',
          amountPence: 1,
        })
      ).json(),
    ).toEqual({
      error: { code: 'event-organiser.budget-fixed' },
    });
    const [, music] = (await account()).budgetLines;
    await expect(
      env.DB.prepare('UPDATE treasury_budget_lines SET amount_pence = 1 WHERE id = ?')
        .bind(music?.id)
        .run(),
    ).rejects.toThrow();
  });
});

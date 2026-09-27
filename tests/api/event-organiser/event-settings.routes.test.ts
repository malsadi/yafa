import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildTestApp, insertNoticeVersion } from '../../app/app-fixtures';
import { readyTaskTracker } from '../task-tracker/task-fixtures';
import { readyTreasury } from '../treasury/treasury-fixtures';
import {
  addEventType,
  APPROVE,
  call,
  colleagueOf,
  CREATE,
  eventBody,
  eventOfficer,
  READ,
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EXNTV';
const TYPE = 'type-EX-talk';
let officer: Officer;
let approver: Officer;
let eventId = '';

const path = (action = '') => `${unitEvents(officer.unitId)}/events/${eventId}${action}`;

describe("the Event organiser's settings, unset (brief 27; 8.1; rule 5)", () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    officer = await eventOfficer({ suffix: 'EX1', notice: NOTICE, capabilities: [READ, CREATE] });
    approver = await colleagueOf(officer, {
      suffix: 'EX2',
      notice: NOTICE,
      capabilities: [APPROVE],
    });
    await readyTreasury(officer.unitId, {
      thresholdPence: 1,
      receiptRequired: false,
      actor: officer.personId,
    });
    await readyTaskTracker(officer.unitId, officer.personId);
    await env.DB.prepare(
      `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('event-organiser', ?, 1, ?, 'test')`,
    )
      .bind(officer.unitId, new Date().toISOString())
      .run();
    await buildTestApp();
    await addEventType(TYPE, 'Talk');
    const created = await call(
      officer.clerkUserId,
      'POST',
      `${unitEvents(officer.unitId)}/events`,
      {
        event: eventBody({ name: 'Talk', typeItemId: TYPE, leadPersonId: officer.personId }),
        templateId: null,
      },
    );
    eventId = (await created.json<{ id: string }>()).id;
    await call(approver.clerkUserId, 'POST', path('/approve'), { version: 1 });
  });

  it('shows no progress until "cancelled tasks count in progress" is set', async () => {
    expect(await (await call(officer.clerkUserId, 'GET', path('/tasks'))).json()).toEqual({
      error: { code: 'setting.not-configured' },
    });
  });

  it('moves an event back only once "status may move backwards" is set; forward moves do not wait', async () => {
    expect(
      (
        await call(officer.clerkUserId, 'POST', path('/status'), {
          to: 'In preparation',
          version: 2,
        })
      ).status,
    ).toBe(204);
    expect(
      await (
        await call(officer.clerkUserId, 'POST', path('/status'), { to: 'Approved', version: 3 })
      ).json(),
    ).toEqual({
      error: { code: 'setting.not-configured' },
    });
  });
});

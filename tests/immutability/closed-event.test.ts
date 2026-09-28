import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventSummary } from '../../src/shared/event-organiser/event-records';
import type { TaskRecord } from '../../src/shared/task-tracker/task-records';
import { closeEvent } from '../../src/worker/services/event-organiser';
import { insertNoticeVersion } from '../app/app-fixtures';
import {
  addEventType,
  APPROVE,
  call,
  CLOSE,
  colleagueOf,
  CREATE,
  eventBody,
  eventOfficer,
  MANAGE,
  READ,
  readyEvents,
  unitEvents,
  type Officer,
} from '../api/event-organiser/event-fixtures';
import { openAccount } from '../api/treasury/treasury-fixtures';
import {
  contextOf,
  nameOrganisation,
  storage,
} from '../services/treasury/treasury-service-fixtures';
import { tryEveryRoute } from './try-every-route';

// Brief 26, Phase 12 and D-184: a closed event, its tasks, budget lines and
// files can't be changed through any route.
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ICNTV';
const TYPE = 'type-IC-fete';
const FILE = 'file-IC-kept';
let organiser: Officer;
let branchAccount = '';
let id = '';
let taskId = '';
let lineId = '';

const events = () => `${unitEvents(organiser.unitId)}/events`;
const read = async () =>
  (await call(organiser.clerkUserId, 'GET', `${events()}/${id}`)).json<EventSummary>();
const render = () => Promise.resolve(new TextEncoder().encode('%PDF report'));

async function attachFile() {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO files (id, key, unit_id, service, record_id, use, file_name, uploaded_by, size, content_type, checksum, locked, created_at)
       VALUES (?, ?, ?, 'event-organiser', ?, 'documents', 'kept.pdf', ?, 3, 'application/pdf', 'x', 0, 'now')`,
    ).bind(FILE, `k/${FILE}`, organiser.unitId, id, organiser.personId),
    env.DB.prepare(
      `INSERT INTO event_files (file_id, event_id, unit_id, section, added_by, added_at)
       VALUES (?, ?, ?, 'Documents', ?, 'now')`,
    ).bind(FILE, id, organiser.unitId, organiser.personId),
  ]);
}

async function closedEvent() {
  const approver = await colleagueOf(organiser, {
    suffix: 'IC2',
    notice: NOTICE,
    capabilities: [APPROVE],
  });
  const created = await call(organiser.clerkUserId, 'POST', events(), {
    event: eventBody({ name: 'Locked fete', typeItemId: TYPE, leadPersonId: organiser.personId }),
    templateId: null,
  });
  id = (await created.json<{ id: string }>()).id;
  await call(organiser.clerkUserId, 'POST', `${events()}/${id}/budget-lines`, {
    name: 'Hall',
    amountPence: 1000,
  });
  await call(organiser.clerkUserId, 'POST', `${events()}/${id}/tasks`, {
    title: 'Book the hall',
    description: null,
    ownerPersonId: organiser.personId,
    dueDate: '2026-05-01',
  });
  await call(approver.clerkUserId, 'POST', `${events()}/${id}/approve`, { version: 1 });
  await attachFile();
  for (const to of ['In preparation', 'Ready', 'Completed'])
    await call(organiser.clerkUserId, 'POST', `${events()}/${id}/status`, {
      to,
      version: (await read()).version,
    });
  await closeEvent(
    env.DB,
    contextOf(organiser),
    { storage, render },
    {
      unitId: organiser.unitId,
      eventId: id,
      version: (await read()).version,
      branchAccountId: branchAccount,
      language: 'en',
    },
  );
}

async function childIds() {
  const tasks = await (
    await call(organiser.clerkUserId, 'GET', `${events()}/${id}/tasks`)
  ).json<{ tasks: TaskRecord[] }>();
  taskId = tasks.tasks[0]?.id ?? '';
  lineId =
    (
      await env.DB.prepare(
        "SELECT l.id FROM treasury_budget_lines l JOIN treasury_accounts a ON a.id = l.account_id WHERE a.event_id = ? AND a.kind = 'event'",
      )
        .bind(id)
        .first<{ id: string }>()
    )?.id ?? '';
}

describe('a closed event, through every route (brief 26; D-184)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    organiser = await eventOfficer({
      suffix: 'IC1',
      notice: NOTICE,
      capabilities: [
        READ,
        CREATE,
        MANAGE,
        CLOSE,
        'task-tracker.tasks.manage',
        'treasury.accounts.read',
        'treasury.accounts.manage',
        'treasury.credit.create',
        'treasury.debit.create',
      ],
    });
    await readyEvents(organiser.unitId, organiser.personId);
    await nameOrganisation(organiser.personId);
    await addEventType(TYPE, 'Fete');
    branchAccount = await openAccount(organiser, 'Bank', 10000);
    await closedEvent();
    await childIds();
  });

  it('refuses every change, and leaves the event, its tasks, budget and files as they were', async () => {
    expect((await read()).status).toBe('Closed');
    const E = '/api/event-organiser/units/:unitId/events/:eventId';
    const T = '/api/task-tracker/units/:unitId/tasks/:taskId';
    const version = (await read()).version;
    const task = {
      title: 'Late',
      description: null,
      ownerPersonId: organiser.personId,
      dueDate: '2099-01-01',
    };
    const result = await tryEveryRoute(
      (method, path, body) => call(organiser.clerkUserId, method, path, body),
      {
        prefixes: [E, T],
        params: { unitId: organiser.unitId, eventId: id, taskId, lineId, fileId: FILE },
        bodies: {
          [`PUT ${E}`]: {
            event: eventBody({
              name: 'Changed',
              typeItemId: TYPE,
              leadPersonId: organiser.personId,
            }),
            version,
          },
          [`POST ${E}/approve`]: { version },
          [`POST ${E}/status`]: { to: 'Ready', version },
          [`POST ${E}/cancel`]: { reason: 'Late', version },
          [`POST ${E}/post-cancellation`]: { version },
          [`POST ${E}/tasks`]: task,
          [`PUT ${E}/tasks/:taskId`]: { task: { ...task, status: 'To do' }, version: 1 },
          [`POST ${E}/budget-lines`]: { name: 'More', amountPence: 1 },
          [`PUT ${E}/budget-lines/:lineId`]: { name: 'Hall', amountPence: 9 },
          [`POST ${E}/files/uploads`]: {
            section: 'Documents',
            use: 'documents',
            fileName: 'late.pdf',
            size: 10,
            contentType: 'application/pdf',
          },
          [`PUT ${E}/files`]: {
            section: 'Documents',
            use: 'documents',
            fileId: 'x',
            fileName: 'late.pdf',
          },
          [`POST ${E}/publish`]: { targets: ['calendar'], version },
          [`POST ${E}/close`]: { branchAccountId: branchAccount, language: 'en', version },
          [`PUT ${T}`]: { task: { ...task, status: 'To do' }, version: 1 },
          [`POST ${T}/status`]: { status: 'To do', version: 1 },
        },
        rows: [
          { sql: 'SELECT * FROM events WHERE id = ?', binds: [id] },
          { sql: 'SELECT * FROM tasks WHERE event_id = ? ORDER BY id', binds: [id] },
          { sql: 'SELECT * FROM event_files WHERE event_id = ? ORDER BY file_id', binds: [id] },
          { sql: 'SELECT * FROM files WHERE record_id = ? ORDER BY id', binds: [id] },
          {
            sql: `SELECT l.* FROM treasury_budget_lines l JOIN treasury_accounts a ON a.id = l.account_id
                  WHERE a.event_id = ? ORDER BY l.id`,
            binds: [id],
          },
        ],
      },
    );
    expect(result.tried.length).toBe(18);
    expect(result.accepted).toEqual([]);
    expect(result.failed).toEqual([]);
    expect(result.rowsChanged).toBe(false);
  });
});

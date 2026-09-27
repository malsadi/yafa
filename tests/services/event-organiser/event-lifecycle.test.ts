import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ReportDocument } from '../../../src/pdf-templates/post-event-report/report-document';
import type { EventSummary } from '../../../src/shared/event-organiser/event-records';
import type { PostEventReport } from '../../../src/shared/event-organiser/post-event-report';
import type { TaskRecord } from '../../../src/shared/task-tracker/task-records';
import { closeEvent } from '../../../src/worker/services/event-organiser';
import { insertNoticeVersion } from '../../app/app-fixtures';
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
  TEMPLATES,
  unitEvents,
  type Officer,
} from '../../api/event-organiser/event-fixtures';
import { openAccount } from '../../api/treasury/treasury-fixtures';
import { contextOf, nameOrganisation, storage } from '../treasury/treasury-service-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ELNTV';
const TYPE = 'type-EL-fete';
const TREASURY = [
  'treasury.accounts.read',
  'treasury.accounts.manage',
  'treasury.credit.create',
  'treasury.debit.create',
];
let organiser: Officer;
let approver: Officer;
let branchAccount = '';
let id = '';
let account = '';

const rendered: ReportDocument[] = [];
const render = (document: ReportDocument) => {
  rendered.push(document);
  return Promise.resolve(new TextEncoder().encode(`%PDF ${document.title}`));
};
const events = () => `${unitEvents(organiser.unitId)}/events`;
const read = async (id: string) =>
  (await call(organiser.clerkUserId, 'GET', `${events()}/${id}`)).json<EventSummary>();
const balanceOf = async (accountId: string) =>
  (
    await env.DB.prepare(
      'SELECT COALESCE(SUM(pence), 0) AS b FROM treasury_movements WHERE account_id = ?',
    )
      .bind(accountId)
      .first<{ b: number }>()
  )?.b;
const eventAccountId = async (id: string) =>
  (
    await env.DB.prepare("SELECT id FROM treasury_accounts WHERE event_id = ? AND kind = 'event'")
      .bind(id)
      .first<{ id: string }>()
  )?.id ?? '';

async function money(
  kind: 'credits' | 'debits',
  accountId: string,
  amountPence: number,
  budgetLineId: string | null,
) {
  const res = await call(
    organiser.clerkUserId,
    'POST',
    `/api/treasury/units/${organiser.unitId}/${kind}`,
    {
      accountId,
      amountPence,
      entryDate: '2026-06-01',
      counterparty: 'Example',
      description: 'Fete',
      budgetLineId,
    },
  );
  expect(res.status).toBe(201);
}

async function approvedEvent(name: string, templateId: string | null = null): Promise<string> {
  const created = await call(organiser.clerkUserId, 'POST', events(), {
    event: eventBody({ name, typeItemId: TYPE, leadPersonId: organiser.personId }),
    templateId,
  });
  const { id } = await created.json<{ id: string }>();
  await call(approver.clerkUserId, 'POST', `${events()}/${id}/approve`, { version: 1 });
  return id;
}

const close = async (id: string, language: 'en' | 'ar' = 'en') =>
  closeEvent(
    env.DB,
    contextOf(organiser),
    { storage, render },
    {
      unitId: organiser.unitId,
      eventId: id,
      version: (await read(id)).version,
      branchAccountId: branchAccount,
      language,
    },
  );

describe('an event from creation to close (brief 21 build notes; C1, C2; 10.1)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    organiser = await eventOfficer({
      suffix: 'EL1',
      notice: NOTICE,
      capabilities: [READ, CREATE, MANAGE, CLOSE, TEMPLATES, ...TREASURY],
    });
    approver = await colleagueOf(organiser, {
      suffix: 'EL2',
      notice: NOTICE,
      capabilities: [APPROVE],
    });
    await readyEvents(organiser.unitId, organiser.personId);
    await nameOrganisation(organiser.personId);
    await addEventType(TYPE, 'Fete');
    branchAccount = await openAccount(organiser, 'Bank', 10000);
  });

  it('is created from a template, with its tasks and budget, and approved by a second officer', async () => {
    const template = await call(
      organiser.clerkUserId,
      'POST',
      `${unitEvents(organiser.unitId)}/templates`,
      {
        name: 'Fete',
        tasks: [{ title: 'Book the hall', description: null, daysBefore: 10 }],
        budgetLines: [{ name: 'Hall', amountPence: 3000 }],
      },
    );
    id = await approvedEvent('Summer fete', (await template.json<{ id: string }>()).id);
    account = await eventAccountId(id);
    expect((await read(id)).status).toBe('Approved');
  });

  it('is spent from, worked on and moved to Completed by its lead officer', async () => {
    const hall = await env.DB.prepare('SELECT id FROM treasury_budget_lines WHERE account_id = ?')
      .bind(account)
      .first<{ id: string }>();
    await money('credits', account, 5000, null);
    await money('debits', account, 2500, hall?.id ?? null);
    const [task] = (
      await (
        await call(organiser.clerkUserId, 'GET', `${events()}/${id}/tasks`)
      ).json<{ tasks: TaskRecord[] }>()
    ).tasks;
    await call(organiser.clerkUserId, 'PUT', `${events()}/${id}/tasks/${task?.id ?? ''}`, {
      task: {
        title: task?.title,
        description: null,
        ownerPersonId: organiser.personId,
        dueDate: task?.dueDate,
        status: 'Done',
      },
      version: task?.version,
    });
    for (const to of ['In preparation', 'Ready', 'Completed'])
      await call(organiser.clerkUserId, 'POST', `${events()}/${id}/status`, {
        to,
        version: (await read(id)).version,
      });
  });

  it('reports its tasks and its budget against actual, with Unallocated (C1; P10)', async () => {
    const report = await (
      await call(organiser.clerkUserId, 'GET', `${events()}/${id}/report`)
    ).json<PostEventReport>();
    expect(report.tasks).toMatchObject({ done: 1, total: 1 });
    expect(report.budget).toEqual({
      lines: [{ name: 'Hall', budgetPence: 3000, incomePence: 0, spendingPence: 2500 }],
      unallocated: { incomePence: 5000, spendingPence: 0 },
      totals: { budgetPence: 3000, incomePence: 5000, spendingPence: 2500 },
      balancePence: 2500,
    });
  });

  it('closes: the account at zero, the branch account up by the balance (C2; 10.1)', async () => {
    const before = await balanceOf(branchAccount);
    await close(id);
    expect(await balanceOf(account)).toBe(0);
    const transfer = await env.DB.prepare(
      "SELECT description FROM treasury_entries WHERE type = 'transfer' AND account_id = ?",
    )
      .bind(account)
      .first<{ description: string }>();
    expect(transfer?.description).toBe('Closing balance: Summer fete'); // D-193
    expect((await balanceOf(branchAccount)) ?? 0).toBe((before ?? 0) + 2500);
  });

  it('is filed to the archive and locked, with its tasks (D-184)', async () => {
    expect((await read(id)).status).toBe('Closed');
    expect(rendered.at(-1)?.title).toBe('Post-event report: Summer fete');
    const filed = await env.DB.prepare(
      'SELECT d.category_id AS category, f.locked FROM archive_documents d JOIN archive_document_versions v ON v.document_id = d.id JOIN files f ON f.id = v.file_id WHERE d.source_record_id = ?',
    )
      .bind(id)
      .all();
    expect(filed.results).toEqual([{ category: 'events', locked: 1 }]);
    await expect(
      env.DB.prepare("UPDATE tasks SET status = 'To do', version = version + 1 WHERE event_id = ?")
        .bind(id)
        .run(),
    ).rejects.toThrow();
    await expect(
      env.DB.prepare("UPDATE events SET name = 'X', version = version + 1 WHERE id = ?")
        .bind(id)
        .run(),
    ).rejects.toThrow();
    expect(
      (
        await call(organiser.clerkUserId, 'POST', `${events()}/${id}/tasks`, {
          title: 'Late',
          description: null,
          ownerPersonId: organiser.personId,
          dueDate: '2099-01-01',
        })
      ).status,
    ).toBe(409);
  });

  it('closes a cancelled event as cancelled, and brings an overspend to zero from the branch account', async () => {
    const id = await approvedEvent('Winter fete');
    await money('debits', await eventAccountId(id), 400, null);
    await call(organiser.clerkUserId, 'POST', `${events()}/${id}/cancel`, {
      reason: 'Snow',
      version: (await read(id)).version,
    });
    const before = await balanceOf(branchAccount);
    await close(id);
    expect(await balanceOf(await eventAccountId(id))).toBe(0);
    expect((await balanceOf(branchAccount)) ?? 0).toBe((before ?? 0) - 400);
    expect(rendered.at(-1)?.title).toBe('Post-event report: Winter fete (cancelled)');
    expect((await read(id)).cancelReason).toBe('Snow');
  });

  it('refuses to close an event that is not completed or cancelled', async () => {
    const id = await approvedEvent('Spring fete');
    await expect(close(id)).rejects.toThrow('event-organiser.not-closable');
  });
});

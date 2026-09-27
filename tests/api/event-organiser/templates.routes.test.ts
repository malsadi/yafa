import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventTemplateRecord } from '../../../src/shared/event-organiser/event-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  CREATE,
  eventOfficer,
  readyEvents,
  TEMPLATES,
  unitEvents,
  type Officer,
} from './event-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ETNTV';
let national: Officer;
let branch: Officer;
let nationalId = '';
let branchId = '';

const template = (name: string) => ({
  name,
  tasks: [{ title: 'Invite guests', description: null, daysBefore: 14 }],
  budgetLines: [{ name: 'Food', amountPence: 10000 }],
});
const choices = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitEvents(o.unitId)}/template-choices`)).json<
    EventTemplateRecord[]
  >();

describe('event templates: national or branch (brief 21 A3; P15, D-178)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    national = await eventOfficer({
      suffix: 'ET1',
      notice: NOTICE,
      capabilities: [TEMPLATES, CREATE],
      unitType: 'national',
    });
    branch = await eventOfficer({
      suffix: 'ET2',
      notice: NOTICE,
      capabilities: [TEMPLATES, CREATE],
    });
    await readyEvents(national.unitId, national.personId);
    await readyEvents(branch.unitId, branch.personId);
    const add = async (o: Officer, name: string) =>
      (
        await (
          await call(o.clerkUserId, 'POST', `${unitEvents(o.unitId)}/templates`, template(name))
        ).json<{
          id: string;
        }>()
      ).id;
    nationalId = await add(national, 'National day');
    branchId = await add(branch, 'Branch picnic');
  });

  it("offers a branch its own templates and the General Council's national ones", async () => {
    expect((await choices(branch)).map((t) => t.name)).toEqual(['Branch picnic', 'National day']);
    expect((await choices(national)).map((t) => t.name)).toEqual(['National day']);
  });

  it("changes a template from the version read; another unit's is not found", async () => {
    const path = `${unitEvents(branch.unitId)}/templates/${nationalId}`;
    expect(
      (await call(branch.clerkUserId, 'PUT', path, { template: template('Mine now'), version: 1 }))
        .status,
    ).toBe(404);
    const own = `${unitEvents(branch.unitId)}/templates/${branchId}`;
    const changed = { ...template('Branch picnic'), budgetLines: [] };
    expect(
      (await call(branch.clerkUserId, 'PUT', own, { template: changed, version: 1 })).status,
    ).toBe(204);
    expect((await choices(branch)).find((t) => t.id === branchId)?.budgetLines).toEqual([]);
    expect(
      (await call(branch.clerkUserId, 'PUT', own, { template: changed, version: 1 })).status,
    ).toBe(409);
  });

  it('is retired from new events and brought back, never deleted', async () => {
    const own = `${unitEvents(branch.unitId)}/templates/${branchId}`;
    expect((await call(branch.clerkUserId, 'POST', `${own}/retire`, { version: 2 })).status).toBe(
      204,
    );
    expect((await choices(branch)).map((t) => t.name)).toEqual(['National day']);
    expect((await call(branch.clerkUserId, 'POST', `${own}/restore`, { version: 3 })).status).toBe(
      204,
    );
    expect((await choices(branch)).map((t) => t.name)).toContain('Branch picnic');
    await expect(
      env.DB.prepare('DELETE FROM event_templates WHERE id = ?').bind(branchId).run(),
    ).rejects.toThrow();
  });
});

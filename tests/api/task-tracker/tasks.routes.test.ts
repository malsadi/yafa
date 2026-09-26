import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { addDaysToDate } from '../../../src/shared/core/add-days-to-date';
import type { TaskHistoryEntry, TaskRecord } from '../../../src/shared/task-tracker/task-records';
import { getTodayInLondon } from '../../../src/worker/core/permissions';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  colleagueOf,
  readyTaskTracker,
  taskOfficer,
  unitTasks,
  type Officer,
} from './task-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TKNV';
const today = getTodayInLondon();
let secretary: Officer;
let owner: Officer;
let outsider: Officer;
let taskId = '';

const base = () => unitTasks(secretary.unitId);
const create = (body: object) => call(secretary.clerkUserId, 'POST', `${base()}/tasks`, body);
const actionList = async (query = '') =>
  (await call(secretary.clerkUserId, 'GET', `${base()}/tasks${query}`)).json<TaskRecord[]>();

describe('the Task tracker (brief 18 A, B1, B2, B4; D-137 to D-141)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    secretary = await taskOfficer({
      suffix: 'TK1',
      notice: NOTICE,
      capabilities: ['task-tracker.tasks.read', 'task-tracker.tasks.manage'],
    });
    owner = await colleagueOf(secretary, { suffix: 'TK2', notice: NOTICE, capabilities: [] });
    outsider = await taskOfficer({
      suffix: 'TK3',
      notice: NOTICE,
      capabilities: ['task-tracker.tasks.read', 'task-tracker.tasks.manage'],
    });
    await readyTaskTracker(secretary.unitId, secretary.personId);
    await readyTaskTracker(outsider.unitId, secretary.personId);
  });

  it('creates a task, To do, owned by one of the unit’s current officers (D-139)', async () => {
    const res = await create({
      title: 'Book hall',
      description: '',
      ownerPersonId: owner.personId,
      dueDate: addDaysToDate(today, 2),
    });
    expect(res.status).toBe(201);
    taskId = (await res.json<{ taskId: string }>()).taskId;
    const notOfficer = await create({
      title: 'X',
      ownerPersonId: outsider.personId,
      dueDate: today,
    });
    expect(await notOfficer.json()).toMatchObject({
      error: { code: 'task-tracker.owner-not-an-officer' },
    });
    expect((await actionList())[0]).toMatchObject({
      title: 'Book hall',
      description: null,
      status: 'To do',
      ownerName: 'Fictional Person',
      dueSoon: true,
      overdue: false,
    });
  });

  it('shows an owner their own tasks and lets them change the status, with no capability (D-137)', async () => {
    const mine = await (
      await call(owner.clerkUserId, 'GET', '/api/task-tracker/my-tasks')
    ).json<TaskRecord[]>();
    expect(mine.map((t) => t.title)).toEqual(['Book hall']);
    expect((await call(owner.clerkUserId, 'GET', `${base()}/tasks`)).status).toBe(403);
    const status = (s: string, version: number, who = owner) =>
      call(who.clerkUserId, 'POST', `${base()}/tasks/${taskId}/status`, { status: s, version });
    expect((await status('In progress', 1)).status).toBe(204);
    expect((await status('Done', 1)).status).toBe(409);
    expect((await status('Done', 2, outsider)).status).toBe(403);
  });

  it('lets a manager change anything, at any time, and filters the action list (D-138; B2)', async () => {
    await create({
      title: 'Print flyers',
      ownerPersonId: secretary.personId,
      dueDate: addDaysToDate(today, -1),
    });
    const put = await call(secretary.clerkUserId, 'PUT', `${base()}/tasks/${taskId}`, {
      version: 2,
      task: {
        title: 'Book the hall',
        description: 'Main room',
        ownerPersonId: secretary.personId,
        dueDate: addDaysToDate(today, 20),
        status: 'Done',
      },
    });
    expect(put.status).toBe(204);
    expect((await actionList(`?ownerPersonId=${secretary.personId}`)).map((t) => t.title)).toEqual([
      'Print flyers',
      'Book the hall',
    ]);
    expect((await actionList('?status=Done')).map((t) => [t.title, t.dueSoon, t.overdue])).toEqual([
      ['Book the hall', false, false],
    ]);
    expect((await actionList('?status=To%20do'))[0]).toMatchObject({
      title: 'Print flyers',
      overdue: true,
    });
  });

  it('keeps a history of who created and changed each task (B4)', async () => {
    const history = await (
      await call(secretary.clerkUserId, 'GET', `${base()}/tasks/${taskId}/history`)
    ).json<TaskHistoryEntry[]>();
    expect(history.map((h) => [h.action, h.changes.map((c) => c.field)])).toEqual([
      ['created', ['title', 'ownerPersonId', 'dueDate', 'status']],
      ['changed', ['status']],
      ['changed', ['title', 'description', 'ownerPersonId', 'dueDate', 'status']],
    ]);
    expect(history[1]?.changes[0]).toEqual({
      field: 'status',
      before: 'To do',
      after: 'In progress',
    });
  });

  it("keeps a unit's tasks to its own officers, and never deletes one (D-140, D-141)", async () => {
    expect((await call(outsider.clerkUserId, 'GET', `${base()}/tasks`)).status).toBe(403);
    await expect(
      env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run(),
    ).rejects.toThrow(/never deleted/);
  });
});

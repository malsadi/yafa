import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { TaskRecord } from '../../../src/shared/task-tracker/task-records';
import { setSetting } from '../../../src/worker/core/settings';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  addEventType,
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

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EKNTV';
const TYPE = 'type-EK-quiz';
let manager: Officer;
let reader: Officer;
let eventId = '';

interface TasksView {
  tasks: TaskRecord[];
  progress: { done: number; total: number; overdue: number };
}
const tasksPath = () => `${unitEvents(manager.unitId)}/events/${eventId}/tasks`;
const view = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', tasksPath())).json<TasksView>();
const task = (title: string, dueDate: string) => ({
  title,
  description: null,
  ownerPersonId: reader.personId,
  dueDate,
});

describe('event tasks: the same records as the Task tracker (brief 21 B1 to B3; 10.1)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await eventOfficer({
      suffix: 'EK1',
      notice: NOTICE,
      capabilities: [READ, CREATE, MANAGE, 'task-tracker.tasks.read'],
    });
    reader = await colleagueOf(manager, { suffix: 'EK2', notice: NOTICE, capabilities: [READ] });
    await readyEvents(manager.unitId, manager.personId);
    await addEventType(TYPE, 'Quiz night');
    const created = await call(
      manager.clerkUserId,
      'POST',
      `${unitEvents(manager.unitId)}/events`,
      {
        event: eventBody({ name: 'Quiz', typeItemId: TYPE, leadPersonId: manager.personId }),
        templateId: null,
      },
    );
    eventId = (await created.json<{ id: string }>()).id;
  });

  it('adds tasks, marked with the event by name, and shows them in the Task tracker too', async () => {
    expect(
      (await call(reader.clerkUserId, 'POST', tasksPath(), task('X', '2099-01-01'))).status,
    ).toBe(403);
    for (const [title, due] of [
      ['Write questions', '2020-01-01'],
      ['Book prizes', '2099-01-01'],
      ['Print sheets', '2099-02-01'],
    ] as const)
      expect((await call(manager.clerkUserId, 'POST', tasksPath(), task(title, due))).status).toBe(
        201,
      );
    const tracker = await call(
      manager.clerkUserId,
      'GET',
      `/api/task-tracker/units/${manager.unitId}/tasks?eventId=${eventId}`,
    );
    const { items: shown } = await tracker.json<{ items: TaskRecord[] }>();
    expect(shown).toHaveLength(3);
    expect(new Set(shown.map((t) => [t.eventId, t.eventName].join(' ')))).toEqual(
      new Set([`${eventId} Quiz`]),
    );
  });

  it('works out progress live, highlighting overdue tasks without blocking (B2)', async () => {
    const { tasks, progress } = await view(reader);
    expect(progress).toEqual({ done: 0, total: 3, overdue: 1 });
    const [first, second] = tasks;
    const change = (t: TaskRecord | undefined, status: string) =>
      call(manager.clerkUserId, 'PUT', `${tasksPath()}/${t?.id ?? ''}`, {
        task: {
          title: t?.title,
          description: null,
          ownerPersonId: reader.personId,
          dueDate: t?.dueDate,
          status,
        },
        version: t?.version,
      });
    expect((await change(first, 'Done')).status).toBe(204);
    expect((await change(second, 'Cancelled')).status).toBe(204);
    expect((await view(reader)).progress).toEqual({ done: 1, total: 2, overdue: 0 });
    await setSetting(env.DB, {
      key: 'event-organiser.cancelled_tasks_count_in_progress',
      value: true,
      actorPersonId: manager.personId,
    });
    expect((await view(reader)).progress).toEqual({ done: 1, total: 3, overdue: 0 });
  });

  it("keeps each task's history: who added, changed or completed it (B3)", async () => {
    const [first] = (await view(reader)).tasks;
    const history = await (
      await call(reader.clerkUserId, 'GET', `${tasksPath()}/${first?.id ?? ''}/history`)
    ).json<{ action: string; changes: { field: string; after: string | null }[] }[]>();
    expect(history.map((h) => h.action)).toEqual(['created', 'changed']);
    expect(history[1]?.changes).toEqual([{ field: 'status', before: 'To do', after: 'Done' }]);
  });
});

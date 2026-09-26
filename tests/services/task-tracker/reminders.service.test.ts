import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { sendTaskReminders } from '../../../src/worker/services/task-tracker';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  colleagueOf,
  readyTaskTracker,
  taskOfficer,
  unitTasks,
  type Officer,
} from '../../api/task-tracker/task-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TRNV';
const TODAY = '2026-10-10';
let manager: Officer;
let owner: Officer;
let quietUnit: Officer;

const inbox = async (personId: string) =>
  (
    await env.DB.prepare(
      'SELECT kind, params_json AS params FROM notifications WHERE person_id = ? ORDER BY created_at, rowid',
    )
      .bind(personId)
      .all<{ kind: string; params: string }>()
  ).results;
async function task(
  creator: Officer,
  taskOwner: Officer,
  title: string,
  dueDate: string,
): Promise<string> {
  const res = await call(creator.clerkUserId, 'POST', `${unitTasks(creator.unitId)}/tasks`, {
    title,
    ownerPersonId: taskOwner.personId,
    dueDate,
  });
  return (await res.json<{ taskId: string }>()).taskId;
}

describe('task reminders (brief 18 B3; 10.2; 11; D-142)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    manager = await taskOfficer({
      suffix: 'TR1',
      notice: NOTICE,
      capabilities: ['task-tracker.tasks.manage'],
    });
    owner = await colleagueOf(manager, { suffix: 'TR2', notice: NOTICE, capabilities: [] });
    quietUnit = await taskOfficer({
      suffix: 'TR3',
      notice: NOTICE,
      capabilities: ['task-tracker.tasks.manage'],
    });
    await readyTaskTracker(manager.unitId, manager.personId, 7, 3);
    await readyTaskTracker(quietUnit.unitId, manager.personId, 7, 3);
    await task(manager, owner, 'Due in 3 days', '2026-10-13');
    await task(manager, owner, 'Due in 4 days', '2026-10-14');
    await task(manager, owner, 'Overdue', '2026-10-09');
    await task(quietUnit, quietUnit, 'Switched off unit', '2026-10-09');
    await env.DB.prepare(
      "UPDATE service_switches SET enabled = 0 WHERE service = 'task-tracker' AND scope = ?",
    )
      .bind(quietUnit.unitId)
      .run();
  });

  it("reminds the owner inside the portal: before the due date, and once overdue — only in units where it's on", async () => {
    expect(await sendTaskReminders(env.DB, TODAY)).toBe(2);
    expect(
      (await inbox(owner.personId)).map((n) => [n.kind, JSON.parse(n.params) as object]),
    ).toEqual([
      ['task-tracker.due-soon', { title: 'Due in 3 days', dueDate: '2026-10-13' }],
      ['task-tracker.overdue', { title: 'Overdue', dueDate: '2026-10-09' }],
    ]);
    expect(await inbox(quietUnit.personId)).toEqual([]);
  });

  it('never sends the same reminder twice for a due date, and sends again for a new one', async () => {
    expect(await sendTaskReminders(env.DB, TODAY)).toBe(0);
    await env.DB.prepare(
      "UPDATE tasks SET due_date = '2026-10-12', version = version + 1 WHERE title = 'Due in 3 days'",
    ).run();
    expect(await sendTaskReminders(env.DB, TODAY)).toBe(1);
  });

  it('reminds no task that is Done or Cancelled, and sends nothing to push (10.2)', async () => {
    await env.DB.prepare(
      "UPDATE tasks SET status = 'Done', version = version + 1 WHERE title = 'Due in 4 days'",
    ).run();
    expect(await sendTaskReminders(env.DB, '2026-10-11')).toBe(0);
    const pushed = await env.DB.prepare('SELECT COUNT(*) AS n FROM push_subscriptions').first<{
      n: number;
    }>();
    expect(pushed?.n).toBe(0);
  });
});

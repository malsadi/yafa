import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { buildInPortalNotificationStatement } from '../../../core/notifications';
import { isServiceEnabled } from '../../../core/service-switches';
import { getSetting } from '../../../core/settings';
import {
  buildReminderSentStatement,
  listRemindersDue,
  type ReminderDue,
  type ReminderKind,
} from './reminders.repo';

/**
 * Brief 18 B3, 11 ("Task reminders"), 10.2 and D-142: remind each open
 * task's owner inside the portal — the set number of days before its due
 * date, and once it is overdue — once per due date. In-portal only: never
 * push, and never the Communication hub (10.2). Units with the Task
 * tracker switched off are skipped; until the days are set, nothing is sent
 * (8.1). Returns how many were sent.
 */
export async function sendTaskReminders(db: D1Database, today: string): Promise<number> {
  const days = await getSetting<number>(db, 'task-tracker.reminder_days_before');
  if (days.status === 'not-configured') return 0;
  const until = addDaysToDate(today, days.value);
  const switchedOn = new Map<string, boolean>();
  let sent = 0;
  for (const kind of ['due-soon', 'overdue'] as const) {
    for (const due of await listRemindersDue(db, { kind, today, until })) {
      if (!switchedOn.has(due.unitId))
        switchedOn.set(due.unitId, await isServiceEnabled(db, 'task-tracker', due.unitId));
      if (switchedOn.get(due.unitId) && (await remind(db, due, kind))) sent += 1;
    }
  }
  return sent;
}

/** One reminder and its record, in one batch; one already recorded (a job running twice) is skipped. */
async function remind(db: D1Database, due: ReminderDue, kind: ReminderKind): Promise<boolean> {
  try {
    await db.batch([
      buildReminderSentStatement(db, { ...due, kind, at: new Date().toISOString() }),
      buildInPortalNotificationStatement(db, {
        personId: due.ownerPersonId,
        kind: `task-tracker.${kind}`,
        params: { title: due.title, dueDate: due.dueDate },
      }),
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) return false;
    throw error;
  }
}

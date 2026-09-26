import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 18 A1 to A4 and D-139 to D-141: a task — title, optional
// description, owner (one of the unit's current officers when set) and due
// date, all changeable at any time; its status by the brief's names. An
// event task is the same record, marked with its event (Phase 8). Never
// deleted: Cancelled instead (D-140). Each save sends its version (9.1).
export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    eventId: text('event_id'),
    title: text('title').notNull(),
    description: text('description'),
    ownerPersonId: text('owner_person_id').notNull(),
    dueDate: text('due_date').notNull(),
    status: text('status', { enum: ['To do', 'In progress', 'Done', 'Cancelled'] }).notNull(),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('tasks_unit_id').on(table.unitId, table.status),
    index('tasks_owner').on(table.ownerPersonId, table.status),
    index('tasks_event_id').on(table.eventId),
  ],
);

// Brief 18 B3 and D-142: each reminder sent, so none goes twice for the
// same due date; a changed due date gets its own.
export const taskRemindersSent = sqliteTable(
  'task_reminders_sent',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull(),
    unitId: text('unit_id').notNull(),
    kind: text('kind', { enum: ['due-soon', 'overdue'] }).notNull(),
    dueDate: text('due_date').notNull(),
    sentAt: text('sent_at').notNull(),
  },
  (table) => [
    index('task_reminders_sent_unit_id').on(table.unitId),
    uniqueIndex('task_reminders_sent_once').on(table.taskId, table.kind, table.dueDate),
  ],
);

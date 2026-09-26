import { z } from 'zod';
import { TASK_STATUSES, type TaskStatus } from '../../../../shared/task-tracker/task-statuses';

const status = z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]);

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** D-139: a task's title, optional description, owner and due date — all given at creation. */
export const taskDetailsSchema = z.object({
  title: z.string().trim().min(1),
  description: z
    .string()
    .trim()
    .transform((text) => (text === '' ? null : text))
    .nullable()
    .default(null),
  ownerPersonId: z.string().min(1),
  dueDate: date,
});

/** D-138: a manager's change — anything about the task, status too — from the version read (9.1). */
export const taskChangeSchema = z.object({
  task: taskDetailsSchema.extend({ status: status }),
  version: z.number().int().positive(),
});

/** D-137: a status change, by the task's owner or a manager. */
export const taskStatusSchema = z.object({
  status: status,
  version: z.number().int().positive(),
});

/** Brief 18 B2: the action list's filters — owner, status, event. */
export const actionListFiltersSchema = z.object({
  ownerPersonId: z.string().min(1).optional(),
  status: status.optional(),
  eventId: z.string().min(1).optional(),
});

export type TaskDetails = z.infer<typeof taskDetailsSchema>;
export type TaskChange = z.infer<typeof taskChangeSchema>['task'];
export type ActionListFilters = z.infer<typeof actionListFiltersSchema>;

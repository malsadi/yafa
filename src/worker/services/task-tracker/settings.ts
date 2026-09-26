import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 9's settings (brief 18; 8.1: no defaults). How many days ahead a
 * task counts as due soon (B1), and how many days before its due date its
 * owner is reminded (B3, D-142). Both are required before the Task tracker
 * is switched on (15 C6).
 */
export function registerTaskTrackerSettings(): void {
  registerSetting({
    key: 'task-tracker.due_soon_window_days',
    label: 'Due soon window (days)',
    description: 'A task due within this many days is highlighted as due soon (18 B1).',
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'task-tracker.reminder_days_before',
    label: 'Reminder (days before the due date)',
    description:
      "How many days before a task's due date its owner is reminded in the portal (18 B3; D-142).",
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
}

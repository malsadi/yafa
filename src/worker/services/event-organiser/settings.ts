import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 1's settings (brief 21; 8.1: no default in code): whether an
 * event's status may move backwards (D-180), and whether cancelled tasks
 * count in its progress (B2). Event types are the list in 15 B3. Required
 * before the Event organiser is switched on (15 C6).
 */
export function registerEventOrganiserSettings(): void {
  registerSetting({
    key: 'event-organiser.status_may_move_backwards',
    label: 'Event status may move backwards',
    description:
      'Whether an event may move back one step at a time between Approved and Completed; never to Draft, never out of Cancelled or Closed (21; D-180).',
    schema: z.boolean(),
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'event-organiser.cancelled_tasks_count_in_progress',
    label: 'Cancelled tasks count in progress',
    description:
      "Whether an event's cancelled tasks count in its progress and post-event report (21 B2, C1; D-183).",
    schema: z.boolean(),
    required: true,
    unitOverrideAllowed: false,
  });
}

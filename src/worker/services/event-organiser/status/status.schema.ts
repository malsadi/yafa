import { z } from 'zod';
import { EVENT_STEPS, type EventStatus } from '../../../../shared/event-organiser/event-statuses';

/** D-180: a move to one of the steps the lead officer takes. */
export const statusMoveSchema = z.object({
  to: z.enum(EVENT_STEPS as [EventStatus, ...EventStatus[]]),
  version: z.number().int().positive(),
});

/** D-181: a cancel, with its reason. */
export const cancelSchema = z.object({
  reason: z.string().trim().min(1),
  version: z.number().int().positive(),
});

import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Brief 21 A1 and D-172: a name, a type from the event types list, a lead
 * officer, a first day with an optional start time, and an optional last
 * day for an event over several days. Nothing else.
 */
export const eventSchema = z
  .object({
    name: z.string().trim().min(1),
    typeItemId: z.string().min(1),
    leadPersonId: z.string().min(1),
    firstDay: date,
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable()
      .default(null),
    lastDay: date.nullable().default(null),
  })
  .refine((e) => e.lastDay === null || e.lastDay >= e.firstDay, {
    message: 'The last day is not before the first.',
    path: ['lastDay'],
  });

/** Brief 21 A1, A3: a new event, from a template or not. */
export const newEventSchema = z.object({
  event: eventSchema,
  templateId: z.string().min(1).nullable().default(null),
});

export const eventSaveSchema = z.object({
  event: eventSchema,
  version: z.number().int().positive(),
});
export const versionSchema = z.object({ version: z.number().int().positive() });

export type EventInput = z.infer<typeof eventSchema>;

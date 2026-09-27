import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = z
  .string()
  .trim()
  .transform((text) => (text === '' ? null : text))
  .nullable()
  .default(null);

/**
 * Brief 22 A1 and D-198: type (from the list), date and start time, a place
 * and/or an online link, chair and secretary.
 */
export const meetingSchema = z
  .object({
    typeItemId: z.string().min(1),
    date,
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    place: optionalText,
    onlineLink: optionalText,
    chairPersonId: z.string().min(1),
    secretaryPersonId: z.string().min(1),
  })
  .refine((m) => m.place !== null || m.onlineLink !== null, {
    message: 'A place or an online link.',
    path: ['place'],
  });

/** A new meeting, with the attendees chosen so far (A2). */
export const newMeetingSchema = z.object({
  meeting: meetingSchema,
  attendeePersonIds: z.array(z.string().min(1)).default([]),
});

export const meetingSaveSchema = z.object({
  meeting: meetingSchema,
  version: z.number().int().positive(),
});
export const versionSchema = z.object({ version: z.number().int().positive() });

export type MeetingInput = z.infer<typeof meetingSchema>;

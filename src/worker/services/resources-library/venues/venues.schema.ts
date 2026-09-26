import { z } from 'zod';

/** An optional text: absent, or written (D-105). */
const optionalText = z
  .string()
  .trim()
  .transform((text) => (text === '' ? null : text))
  .nullable()
  .default(null);

/** Brief 16 B1 and D-105: only the name is required; the cost is in pence (9.1). */
export const venueDetailsSchema = z.object({
  name: z.string().trim().min(1),
  address: optionalText,
  capacity: z.number().int().positive().nullable().default(null),
  facilities: optionalText,
  contactName: optionalText,
  contactPhone: optionalText,
  contactEmail: optionalText,
  typicalCostPence: z.number().int().nonnegative().nullable().default(null),
  typicalCostNote: optionalText,
});

export const venueSaveSchema = z.object({
  venue: venueDetailsSchema,
  version: z.number().int().positive(),
});

export const venueNoteSchema = z.object({ text: z.string().trim().min(1) });

export type VenueDetailsInput = z.infer<typeof venueDetailsSchema>;

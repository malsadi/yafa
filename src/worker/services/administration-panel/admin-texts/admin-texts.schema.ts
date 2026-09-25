import { z } from 'zod';

/** A text in both languages, as written: English required, Arabic may wait (D-022). */
export const adminTextSchema = z.object({
  textEn: z.string().trim().min(1),
  textAr: z.string().trim().nullable(),
});

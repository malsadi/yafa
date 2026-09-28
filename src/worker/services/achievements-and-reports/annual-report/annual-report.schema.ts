import { z } from 'zod';
import { LANGUAGES } from '../../../../shared/core/languages';

export const startReportSchema = z.object({ year: z.number().int().min(1) });
/** O-157: the branch's own summary; empty means none. */
export const summarySchema = z.object({
  summary: z.string().trim().nullable(),
  version: z.number().int().positive(),
});
/** O-158 and 9.4: finalised from the version read, its PDF in the finalising officer's language. */
export const finaliseSchema = z.object({
  version: z.number().int().positive(),
  language: z.enum(LANGUAGES),
});

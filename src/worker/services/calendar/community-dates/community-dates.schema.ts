import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = z
  .string()
  .trim()
  .transform((text) => (text === '' ? null : text))
  .nullable()
  .default(null);

/**
 * Brief 19 A3, D-145 and D-146: a title; a first and last day (the same for
 * one day); an optional time and description; and, for the General
 * Council only, whether it is for all branches.
 */
export const communityDateSchema = z
  .object({
    title: z.string().trim().min(1),
    startDate: date,
    endDate: date,
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable()
      .default(null),
    description: optionalText,
    forAllBranches: z.boolean(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'The last day is not before the first.',
    path: ['endDate'],
  });

export const communityDateSaveSchema = z.object({
  date: communityDateSchema,
  version: z.number().int().positive(),
});
export const versionSchema = z.object({ version: z.number().int().positive() });

export type CommunityDateInput = z.infer<typeof communityDateSchema>;

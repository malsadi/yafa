import { z } from 'zod';

const text = z.string().trim().min(1);

/** Brief 24 A1 and D-215 (O-151): an achievement's details and the officers it is credited to. */
export const achievementSchema = z.object({
  title: text,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryItemId: text,
  description: text,
  officerPersonIds: z.array(text).min(1),
});

export const changeAchievementSchema = z.object({
  achievement: achievementSchema,
  version: z.number().int().positive(),
});

export const versionSchema = z.object({ version: z.number().int().positive() });

export type AchievementInput = z.infer<typeof achievementSchema>;

import { z } from 'zod';

const text = z.string().trim().min(1);

/** Brief 20 A3: a title and text, to all branches or to at least one chosen branch. */
export const circularSchema = z.union([
  z.object({ title: text, body: text, toAllBranches: z.literal(true) }),
  z.object({
    title: text,
    body: text,
    toAllBranches: z.literal(false),
    unitIds: z.array(z.string().min(1)).min(1),
  }),
]);

export type CircularInput = z.infer<typeof circularSchema>;

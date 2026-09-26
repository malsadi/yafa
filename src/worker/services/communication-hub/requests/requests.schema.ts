import { z } from 'zod';

const text = z.string().trim().min(1);

/** Brief 20 B3 and P13: a subject and text, to all other branches or to at least one chosen branch. */
export const requestSchema = z.union([
  z.object({ subject: text, body: text, toAllBranches: z.literal(true) }),
  z.object({
    subject: text,
    body: text,
    toAllBranches: z.literal(false),
    unitIds: z.array(z.string().min(1)).min(1),
  }),
]);

export type RequestInput = z.infer<typeof requestSchema>;

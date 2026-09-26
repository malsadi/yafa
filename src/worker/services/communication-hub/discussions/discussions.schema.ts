import { z } from 'zod';

const ids = z.array(z.string().min(1));

/** Brief 20 B2 and D-159: a subject, the first message, and the officers invited (more can follow). */
export const discussionSchema = z.object({
  subject: z.string().trim().min(1),
  body: z.string().trim().min(1),
  personIds: ids,
});

export const inviteSchema = z.object({ personIds: ids.min(1) });

export type DiscussionInput = z.infer<typeof discussionSchema>;

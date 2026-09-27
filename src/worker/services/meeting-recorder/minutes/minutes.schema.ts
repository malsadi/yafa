import { z } from 'zod';

const count = z.number().int().min(0);

/** D-205: an officer's comment, new (no version) or changed from the version read (9.1). */
export const commentSchema = z.object({
  comment: z.string().trim().min(1),
  version: z.number().int().positive().nullable(),
});

/** D-206: a vote (the numbers and its result in words) or a decision (written text). */
export const outcomeSchema = z.object({
  outcome: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('vote'),
      votesFor: count,
      votesAgainst: count,
      votesAbstain: count,
      voteResult: z.string().trim().min(1),
    }),
    z.object({ kind: z.literal('decision'), decision: z.string().trim().min(1) }),
  ]),
  version: z.number().int().positive(),
});

export type Outcome = z.infer<typeof outcomeSchema>['outcome'];

import { z } from 'zod';

const text = z.string().trim().min(1);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const ids = z.array(z.string().min(1)).min(1);

/**
 * Brief 20 A2, P11 and D-156: a vote — a question, at least two different
 * options (one to be chosen), a closing date, and who can vote.
 */
export const voteSchema = z.object({
  question: text,
  options: z
    .array(text)
    .min(2)
    .refine((options) => new Set(options).size === options.length, {
      message: 'The options are different.',
    }),
  closesOn: day,
  eligibility: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('unit') }),
    z.object({ kind: z.literal('roles'), roleIds: ids }),
    z.object({ kind: z.literal('named'), personIds: ids }),
  ]),
});

/** Brief 20 A1: an officer's notice — a title and text — perhaps put to a vote. */
export const noticeSchema = z.object({ title: text, body: text, vote: voteSchema.nullable() });

/** D-155: a change from the version read; the vote left out stays as it is, null removes it. */
export const noticeChangeSchema = z.object({
  version: z.number().int().positive(),
  notice: z.object({ title: text, body: text, vote: voteSchema.nullable().optional() }),
});

export const versionSchema = z.object({ version: z.number().int().positive() });
export const ballotSchema = z.object({ optionId: z.string().min(1) });
export const closingDateSchema = z.object({ closesOn: day });

export type VoteInput = z.infer<typeof voteSchema>;
export type NoticeInput = z.infer<typeof noticeSchema>;
export type NoticeChangeInput = z.infer<typeof noticeChangeSchema>['notice'];

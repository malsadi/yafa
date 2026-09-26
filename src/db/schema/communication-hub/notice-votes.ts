import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 20 A2, P11, P12, D-155 and D-156: a notice's vote — a question, one
// choice among the options, who can vote (chosen when it is created) and a
// closing date, ending at the close of that day in London (`closes_at`,
// UTC). Nothing about it changes once anyone has voted.
export const noticeVotes = sqliteTable('notice_votes', {
  noticeId: text('notice_id').primaryKey(),
  question: text('question').notNull(),
  closesOn: text('closes_on').notNull(),
  closesAt: text('closes_at').notNull(),
  /** P11: 'unit' (all officers of the unit), 'roles' or 'named'. */
  eligibility: text('eligibility').notNull(),
});

export const noticeVoteOptions = sqliteTable(
  'notice_vote_options',
  {
    id: text('id').primaryKey(),
    noticeId: text('notice_id').notNull(),
    position: integer('position').notNull(),
    label: text('label').notNull(),
  },
  (table) => [uniqueIndex('notice_vote_options_position').on(table.noticeId, table.position)],
);

/** P11: the roles chosen, for a vote open to officers holding them. */
export const noticeVoteRoles = sqliteTable(
  'notice_vote_roles',
  { noticeId: text('notice_id').notNull(), roleId: text('role_id').notNull() },
  (table) => [primaryKey({ columns: [table.noticeId, table.roleId] })],
);

/** P11: the eligible voters, chosen when the vote is created. */
export const noticeVoteVoters = sqliteTable(
  'notice_vote_voters',
  { noticeId: text('notice_id').notNull(), personId: text('person_id').notNull() },
  (table) => [primaryKey({ columns: [table.noticeId, table.personId] })],
);

/** Brief 20 rules and P12: one vote per person (a unique constraint), never changed. */
export const noticeBallots = sqliteTable(
  'notice_ballots',
  {
    noticeId: text('notice_id').notNull(),
    personId: text('person_id').notNull(),
    optionId: text('option_id').notNull(),
    castAt: text('cast_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.noticeId, table.personId] })],
);

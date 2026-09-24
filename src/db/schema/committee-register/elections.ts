import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { people } from './people';
import { roles } from './roles';
import { units } from './units';

// Brief 14 C1, P3, D-055, D-066, D-068. An election is a Draft until
// confirmed; once Confirmed it, its positions and candidates are locked
// (migration 0022). A correction is a new election referring to the one it
// corrects. New terms start on `terms_start_date`, entered at confirmation.
export const elections = sqliteTable('elections', {
  id: text('id').primaryKey(),
  unitId: text('unit_id')
    .notNull()
    .references(() => units.id),
  electionDate: text('election_date').notNull(),
  status: text('status', { enum: ['Draft', 'Confirmed'] }).notNull(),
  correctsElectionId: text('corrects_election_id').references((): AnySQLiteColumn => elections.id),
  termsStartDate: text('terms_start_date'),
  confirmedAt: text('confirmed_at'),
  confirmedBy: text('confirmed_by').references(() => people.id),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => people.id),
});

// A position is a role to be filled, with its number of seats (D-066).
export const electionPositions = sqliteTable('election_positions', {
  id: text('id').primaryKey(),
  electionId: text('election_id')
    .notNull()
    .references(() => elections.id),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  seats: integer('seats').notNull(),
});

// Each candidate for a position, their vote count and whether they were
// elected (D-055). Candidates may be people not yet in the portal (P3).
export const electionCandidates = sqliteTable(
  'election_candidates',
  {
    id: text('id').primaryKey(),
    positionId: text('position_id')
      .notNull()
      .references(() => electionPositions.id),
    personId: text('person_id')
      .notNull()
      .references(() => people.id),
    votes: integer('votes'),
    elected: integer('elected', { mode: 'boolean' }),
  },
  (table) => [unique('election_candidates_position_person').on(table.positionId, table.personId)],
);

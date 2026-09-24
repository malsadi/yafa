import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from './people';
import { roles } from './roles';
import { units } from './units';

// Brief 14 C2 and D-067: a handover from an outgoing to an incoming officer.
// Each confirms the whole handover once (who is the named person; when is
// recorded). Complete when both have; then locked (migration 0020).
export const handovers = sqliteTable('handovers', {
  id: text('id').primaryKey(),
  unitId: text('unit_id')
    .notNull()
    .references(() => units.id),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  outgoingPersonId: text('outgoing_person_id')
    .notNull()
    .references(() => people.id),
  incomingPersonId: text('incoming_person_id')
    .notNull()
    .references(() => people.id),
  outgoingConfirmedAt: text('outgoing_confirmed_at'),
  incomingConfirmedAt: text('incoming_confirmed_at'),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => people.id),
});

// The checklist, started from the handover items list (25 B3) and changed
// for this handover only until confirmation starts (D-067). Names are
// copied, so renaming the list later never rewrites a handover.
export const handoverItems = sqliteTable('handover_items', {
  id: text('id').primaryKey(),
  handoverId: text('handover_id')
    .notNull()
    .references(() => handovers.id),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  tickedAt: text('ticked_at'),
  tickedBy: text('ticked_by').references(() => people.id),
  createdAt: text('created_at').notNull(),
});

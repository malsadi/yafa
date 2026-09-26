import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 16 B1, D-105, D-106 and D-100: a venue used before. Only the name is
// required. The contact person is a name, phone and email; the typical cost
// is in pence (9.1) with a note of what it covers. Retired, never deleted.
export const venues = sqliteTable(
  'library_venues',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    capacity: integer('capacity'),
    facilities: text('facilities'),
    contactName: text('contact_name'),
    contactPhone: text('contact_phone'),
    contactEmail: text('contact_email'),
    typicalCostPence: integer('typical_cost_pence'),
    typicalCostNote: text('typical_cost_note'),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('library_venues_unit_id').on(table.unitId)],
);

// D-098 and D-107: a venue's notes from past use, a dated history — each
// showing who wrote it and when, never changed; retired, with who and when,
// and brought back (D-114).
export const venueNotes = sqliteTable(
  'library_venue_notes',
  {
    id: text('id').primaryKey(),
    venueId: text('venue_id').notNull(),
    unitId: text('unit_id').notNull(),
    text: text('text').notNull(),
    writtenBy: text('written_by').notNull(),
    writtenAt: text('written_at').notNull(),
    retiredAt: text('retired_at'),
    retiredBy: text('retired_by'),
  },
  (table) => [
    index('library_venue_notes_unit_id').on(table.unitId),
    index('library_venue_notes_venue_id').on(table.venueId),
  ],
);

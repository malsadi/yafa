import { sql } from 'drizzle-orm';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 14 A1 and 25 B1: a branch's name (in English and Arabic, D-054),
// code, area and status (active or inactive, P4). The General Council is
// the one `national` unit and has no area. Letterhead address and calendar
// colour (25 B1, D-076): no two units share a colour (D-078).
export const units = sqliteTable(
  'units',
  {
    id: text('id').primaryKey(),
    type: text('type', { enum: ['national', 'branch'] }).notNull(),
    code: text('code').notNull().unique(),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    area: text('area'),
    status: text('status', { enum: ['active', 'inactive'] }).notNull(),
    // Brief 25 B1 and D-076: the letterhead address in both languages, and
    // the calendar colour, chosen from the calendar colours list.
    letterheadAddressEn: text('letterhead_address_en'),
    letterheadAddressAr: text('letterhead_address_ar'),
    calendarColourId: text('calendar_colour_id'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('units_calendar_colour_unique')
      .on(table.calendarColourId)
      .where(sql`${table.calendarColourId} IS NOT NULL`),
  ],
);

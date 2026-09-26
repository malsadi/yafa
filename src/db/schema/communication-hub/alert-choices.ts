import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 C2: the alert types an officer has chosen to receive. Until they
// first choose, they get the types switched on for new officers (the
// setting, 25 C4; D-163). National circulars always notify, so they are
// never part of the choice.
export const alertChoices = sqliteTable('alert_choices', {
  personId: text('person_id').primaryKey(),
  /** A JSON list of the switchable alert types they receive. */
  alertTypes: text('alert_types').notNull(),
  updatedAt: text('updated_at').notNull(),
});

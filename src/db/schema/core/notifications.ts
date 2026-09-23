import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from '../committee-register/people';

// Brief section 9.5: the in-portal notification inbox, shared by the
// Communication hub and the Task tracker (T-057). `kind` is a code, never
// prose (T-018) — the web app maps it, plus `params_json`, to text in the
// officer's language. No push fields here: the Web Push half is a
// separate table/module (core/push), kept apart deliberately (T-057).
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    personId: text('person_id')
      .notNull()
      .references(() => people.id),
    kind: text('kind').notNull(),
    paramsJson: text('params_json'),
    readAt: text('read_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('notifications_person_created_idx').on(table.personId, table.createdAt)],
);

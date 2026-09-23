import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { people } from '../committee-register/people';

// Brief section 9.5: `core/push`'s subscription storage half — one row per
// browser/device an officer has subscribed on (T-057, T-058). `p256dh`/
// `auth` are the subscription's own encryption keys (Push API), never
// generated here. `expirationTime` mirrors the browser's own
// `PushSubscription.expirationTime` (nullable — most browsers never set
// it); it is the literal "expired" a Push pruning job (brief section 11)
// can check against, without guessing at an inactivity policy the brief
// never states (T-059).
export const pushSubscriptions = sqliteTable(
  'push_subscriptions',
  {
    id: text('id').primaryKey(),
    personId: text('person_id')
      .notNull()
      .references(() => people.id),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    expirationTime: integer('expiration_time'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    unique('push_subscriptions_endpoint_unique').on(table.endpoint),
    index('push_subscriptions_person_idx').on(table.personId),
  ],
);

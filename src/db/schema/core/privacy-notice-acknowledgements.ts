import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { people } from '../committee-register/people';
import { privacyNoticeVersions } from './privacy-notice-versions';

// D-005: "the portal records who, when, and which version of the text."
// Append-only (T-020) — an acknowledgement is a fact of history, never
// corrected in place. Unique per (person, version): re-submitting the same
// acknowledgement is a duplicate click, not a second event.
export const privacyNoticeAcknowledgements = sqliteTable(
  'privacy_notice_acknowledgements',
  {
    id: text('id').primaryKey(),
    personId: text('person_id')
      .notNull()
      .references(() => people.id),
    noticeVersionId: text('notice_version_id')
      .notNull()
      .references(() => privacyNoticeVersions.id),
    acknowledgedAt: text('acknowledged_at').notNull(),
  },
  (table) => [
    unique('privacy_notice_acknowledgements_person_version_unique').on(
      table.personId,
      table.noticeVersionId,
    ),
  ],
);

import { NATIONAL_SCOPE } from '../../src/shared/core/national-scope.ts';
import { E2E_SETTINGS, E2E_WORLD, q } from './e2e-world.ts';

const SERVICES_ON = [
  'treasury',
  'task-tracker',
  'event-organiser',
  'calendar',
  'communication-hub',
];

/** Brief 8.1: each setting at national level, with its history row, as `setSetting` writes them. */
export function settingsSql(newId: () => string, now: string): string[] {
  return Object.entries(E2E_SETTINGS).flatMap(([key, value]) => [
    `INSERT INTO settings (key, scope, value, updated_at, updated_by) VALUES (${q(key)}, ${q(NATIONAL_SCOPE)}, ${q(JSON.stringify(value))}, ${q(now)}, 'e2e');`,
    `INSERT INTO settings_history (id, key, scope, previous_value, new_value, changed_at, changed_by) VALUES (${q(newId())}, ${q(key)}, ${q(NATIONAL_SCOPE)}, NULL, ${q(JSON.stringify(value))}, ${q(now)}, 'e2e');`,
  ]);
}

/** Brief 8.4: the journeys' services switched on, portal-wide. */
export function switchesSql(now: string): string[] {
  return SERVICES_ON.map(
    (service) =>
      `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES (${q(service)}, ${q(NATIONAL_SCOPE)}, 1, ${q(now)}, 'e2e');`,
  );
}

/** 15 B3: an event type; brief 17 A1: the branch's bank account, with an opening balance (P6). */
export function branchSql(newId: () => string, now: string): string[] {
  const account = newId();
  const branch = `(SELECT id FROM units WHERE code = ${q(E2E_WORLD.branch.code)})`;
  const treasurer = "(SELECT id FROM people WHERE email LIKE 'e2e.treasurer%')";
  return [
    `INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at) VALUES (${q(newId())}, 'event-types', ${q(E2E_WORLD.eventType.nameEn)}, ${q(E2E_WORLD.eventType.nameAr)}, 1, NULL, NULL, ${q(now)});`,
    `INSERT INTO treasury_accounts (id, unit_id, kind, name, branch_type, event_id, status, opened_by, opened_at, closed_by, closed_at)
     VALUES (${q(account)}, ${branch}, 'branch', ${q(E2E_WORLD.bankAccount)}, 'bank', NULL, 'Open', ${treasurer}, ${q(now)}, NULL, NULL);`,
    `INSERT INTO treasury_entries (id, unit_id, type, account_id, to_account_id, amount_pence, entry_date, counterparty, description, budget_line_id, approval_status, reverses_entry_id, created_by, created_at)
     VALUES (${q(newId())}, ${branch}, 'opening-balance', ${q(account)}, NULL, 100000, ${q(now.slice(0, 10))}, NULL, NULL, NULL, 'Not needed', NULL, ${treasurer}, ${q(now)});`,
  ];
}

/**
 * Brief 20 A2 and P12: a vote the branch's officers have voted in, closing
 * a few minutes after the database is made — so a journey can see its
 * results once it closes by the real rules. Ballots are cast while it is
 * open, as the database requires.
 */
export function closingVoteSql(newId: () => string, now: Date, closesInSeconds: number): string[] {
  const notice = newId();
  const [first, second] = [newId(), newId()];
  const closesAt = new Date(now.getTime() + closesInSeconds * 1000).toISOString();
  const closesOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(
    new Date(closesAt),
  );
  const { title, question, options } = E2E_WORLD.closingVote;
  const person = (who: string) => `(SELECT id FROM people WHERE email LIKE 'e2e.${who}%')`;
  const at = q(now.toISOString());
  return [
    `INSERT INTO notices (id, unit_id, source, automatic_kind, source_record_id, title, body, about_date, retired_at, version, created_by, created_at, updated_by, updated_at)
     VALUES (${q(notice)}, (SELECT id FROM units WHERE code = ${q(E2E_WORLD.branch.code)}), 'officer', NULL, NULL, ${q(title)}, ${q(title)}, NULL, NULL, 1, ${person('treasurer')}, ${at}, ${person('treasurer')}, ${at});`,
    `INSERT INTO notice_votes (notice_id, question, closes_on, closes_at, eligibility) VALUES (${q(notice)}, ${q(question)}, ${q(closesOn)}, ${q(closesAt)}, 'unit');`,
    `INSERT INTO notice_vote_options (id, notice_id, position, label) VALUES (${q(first)}, ${q(notice)}, 1, ${q(options[0])}), (${q(second)}, ${q(notice)}, 2, ${q(options[1])});`,
    ...['treasurer', 'approver', 'officer'].map(
      (who) =>
        `INSERT INTO notice_vote_voters (notice_id, person_id) VALUES (${q(notice)}, ${person(who)});`,
    ),
    `INSERT INTO notice_ballots (notice_id, person_id, option_id, cast_at) VALUES (${q(notice)}, ${person('approver')}, ${q(first)}, ${at});`,
    `INSERT INTO notice_ballots (notice_id, person_id, option_id, cast_at) VALUES (${q(notice)}, ${person('officer')}, ${q(first)}, ${at});`,
  ];
}

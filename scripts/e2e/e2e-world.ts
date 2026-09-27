import { buildSeedSql } from '../seed/build-seed-sql.ts';
import { TEST_OFFICERS } from './test-officers.ts';

/**
 * T-149: the fictional world the browser journeys run in (brief 27) — a
 * General Council and one branch, a role for each test officer with the
 * capabilities its journeys need, the settings those services read, and a
 * bank account. Only for the browser tests' own local database; never the
 * owner's data, and never the seed/ folder (that is the owner's alone).
 */
export const E2E_WORLD = {
  national: { code: 'E2E-GC', nameEn: 'Fictional Council (test)', nameAr: 'مجلس تجريبي' },
  branch: { code: 'E2E-BRANCH', nameEn: 'Fictional Branch (test)', nameAr: 'فرع تجريبي' },
  bankAccount: 'Fictional Bank (test)',
  eventType: { nameEn: 'Fictional fair (test)', nameAr: 'مهرجان تجريبي' },
  meetingType: { nameEn: 'Fictional committee meeting (test)', nameAr: 'اجتماع لجنة تجريبي' },
  closingVote: {
    title: 'Fictional closed vote (test)',
    question: 'Which hall?',
    options: ['North hall', 'South hall'],
  },
} as const;

export const OWN = 'own unit';
/** Administration panel grants are portal-wide (25; D-046); every other is the officer's own unit. */
const scopeOf = (capability: string) =>
  capability.startsWith('administration-panel.') ? 'all units' : OWN;

/** The role each test officer holds, where, and what it may do. */
export const ROLES = {
  treasurer: {
    unit: 'branch',
    nameAr: 'أمين الصندوق (تجريبي)',
    capabilities: [
      'treasury.accounts.read',
      'treasury.accounts.manage',
      'treasury.credit.create',
      'treasury.debit.create',
      'event-organiser.events.read',
      'event-organiser.events.create',
      'event-organiser.events.manage',
      'event-organiser.events.close',
      'communication-hub.noticeboard.read',
      'communication-hub.noticeboard.manage',
      'meeting-recorder.meetings.read',
      'meeting-recorder.meetings.manage',
    ],
  },
  approver: {
    unit: 'branch',
    nameAr: 'المعتمِد (تجريبي)',
    capabilities: [
      'treasury.accounts.read',
      'treasury.debit.approve',
      'event-organiser.events.read',
      'event-organiser.events.approve',
      'meeting-recorder.meetings.read',
      'communication-hub.noticeboard.read',
    ],
  },
  officer: {
    unit: 'branch',
    nameAr: 'مسؤول (تجريبي)',
    capabilities: ['communication-hub.noticeboard.read'],
  },
  // Not a system administrator: those must use a second factor (6.3), which
  // the test sign-in doesn't. A matrix grant, portal-wide, is enough here.
  administrator: {
    unit: 'national',
    nameAr: 'مسؤول الإعدادات (تجريبي)',
    capabilities: ['administration-panel.service-settings.manage'],
  },
} as const;

/** The values the journeys' services read (8.1: none has a default in code). Fictional test values. */
export const E2E_SETTINGS: Record<string, unknown> = {
  'treasury.approval_threshold': 10000,
  'treasury.financial_year_start': { month: 4, day: 1 },
  'treasury.receipt_required': false,
  'task-tracker.due_soon_window_days': 7,
  'task-tracker.reminder_days_before': 3,
  'event-organiser.status_may_move_backwards': false,
  'event-organiser.cancelled_tasks_count_in_progress': false,
  'communication-hub.alert_types_for_new_officers': ['notices', 'votes', 'replies', 'requests'],
  'communication-hub.push_max_attempts': 5,
  'communication-hub.undelivered_alert_retention_days': 30,
  'calendar.feed_includes_all_branch_dates': false,
  'committee-register.roles_requiring_mfa': [],
  'administration-panel.organisation_name': { en: 'Fictional Council (test)', ar: 'مجلس تجريبي' },
  'administration-panel.file_types_documents': ['application/pdf'],
  'administration-panel.file_size_limit_documents_mb': 5,
  'administration-panel.download_link_threshold_mb': 1,
  'administration-panel.download_link_lifetime_minutes': 5,
  'meeting-recorder.minutes_autosave_seconds': 20,
};

export const roleName = (key: string) => `${key[0]?.toUpperCase() ?? ''}${key.slice(1)} (test)`;

/** A SQL string literal. */
export const q = (value: string) => `'${value.replaceAll("'", "''")}'`;

export function peopleSql(newId: () => string, now: string): string[] {
  const { national, branch } = E2E_WORLD;
  return buildSeedSql(
    {
      units: [
        {
          type: 'national',
          code: national.code,
          nameEn: national.nameEn,
          nameAr: national.nameAr,
          area: null,
          status: 'active',
        },
        {
          type: 'branch',
          code: branch.code,
          nameEn: branch.nameEn,
          nameAr: branch.nameAr,
          area: null,
          status: 'active',
        },
      ],
      roles: TEST_OFFICERS.map((o) => ({
        nameEn: roleName(o.key),
        nameAr: ROLES[o.key].nameAr,
        designation: null,
      })),
      terms: TEST_OFFICERS.map((o) => ({
        email: o.email,
        name: `${o.firstName} ${o.lastName}`,
        phone: o.phone,
        systemAdministrator: false,
        roleNameEn: roleName(o.key),
        unitCode: ROLES[o.key].unit === 'branch' ? branch.code : national.code,
        startDate: '2026-01-01',
        endDate: null,
      })),
      notice: { en: 'Fictional privacy notice (test).', ar: 'إشعار خصوصية تجريبي.' },
    },
    { language: 'en', now, newId },
  );
}

/** Each test officer linked to their Clerk user, as the webhook would, and their notice acknowledged. */
export function linkSql(newId: () => string, now: string): string[] {
  return TEST_OFFICERS.flatMap((o) => [
    `UPDATE people SET clerk_user_id = ${q(o.clerkUserId)}, language = NULL WHERE email = ${q(o.email)};`,
    `INSERT INTO privacy_notice_acknowledgements (id, person_id, notice_version_id, acknowledged_at)
     SELECT ${q(newId())}, p.id, v.id, ${q(now)} FROM people p, privacy_notice_versions v WHERE p.email = ${q(o.email)};`,
  ]);
}

export function grantsSql(newId: () => string, now: string): string[] {
  return TEST_OFFICERS.flatMap((o) =>
    ROLES[o.key].capabilities.map(
      (capability) =>
        `INSERT INTO permission_grants (id, role_id, capability, scope, created_at)
         SELECT ${q(newId())}, id, ${q(capability)}, ${q(scopeOf(capability))}, ${q(now)} FROM roles WHERE name_en = ${q(roleName(o.key))};`,
    ),
  );
}

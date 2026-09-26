import { NotFoundError, ServiceUnavailableError } from '../../../core/errors';
import { can, getTodayInLondon } from '../../../core/permissions';
import { isServiceEnabled } from '../../../core/service-switches';
import { getSetting } from '../../../core/settings';
import { readBranding } from '../../administration-panel';
import { listCurrentTermsOf } from '../../committee-register';
import { hashFeedToken } from '../feed-tokens/feed-token-hash';
import { personOfFeedTokenHash } from '../feed-tokens/feed-tokens.repo';
import { buildIcs } from './ics';
import { listFeedRows } from './feed.repo';

/** D-026: the officer's saved language; if none, Arabic when the device asks for it, otherwise English. */
async function feedLanguage(
  db: D1Database,
  personId: string,
  acceptLanguage: string | null,
): Promise<'en' | 'ar'> {
  const row = await db
    .prepare('SELECT language FROM people WHERE id = ?')
    .bind(personId)
    .first<{ language: 'en' | 'ar' | null }>();
  if (row?.language) return row.language;
  return acceptLanguage?.trim().toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

/** Brief 6.4: the units whose calendar the officer may see now — current terms, switched on, readable. */
async function readableUnits(db: D1Database, personId: string): Promise<string[]> {
  const unitIds = [
    ...new Set((await listCurrentTermsOf(db, personId, getTodayInLondon())).map((t) => t.unitId)),
  ];
  const ctx = { personId, units: unitIds, roles: [], capabilities: [], isSystemAdmin: false };
  const checks = await Promise.all(
    unitIds.map(
      async (unitId) =>
        (await isServiceEnabled(db, 'calendar', unitId)) &&
        can(db, ctx, 'calendar.calendar.read', { unitId }),
    ),
  );
  return unitIds.filter((_, i) => checks[i]);
}

/**
 * Brief 6.4, 19 C1 and D-148: the phone feed for a token — only what that
 * officer may see: their units' meetings, events and community dates, and
 * the General Council's dates for all branches when the setting says so.
 * An unknown or revoked token is not found.
 */
export async function calendarFeed(
  db: D1Database,
  token: string,
  acceptLanguage: string | null,
): Promise<string> {
  const personId = await personOfFeedTokenHash(db, await hashFeedToken(token));
  if (!personId) throw new NotFoundError('calendar.feed-not-found');
  const setting = await getSetting<boolean>(db, 'calendar.feed_includes_all_branch_dates');
  if (setting.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  const unitIds = await readableUnits(db, personId);
  const language = await feedLanguage(db, personId, acceptLanguage);
  const rows = await listFeedRows(db, {
    unitIds,
    allBranchDates: setting.value && unitIds.length > 0,
    language,
  });
  const { organisationName } = await readBranding(db);
  const name = organisationName
    ? ((language === 'ar' ? organisationName.ar : null) ?? organisationName.en)
    : null;
  const events = rows.map(({ unitName, ...row }) => ({
    ...row,
    description: [unitName, row.description].filter(Boolean).join('\n'),
  }));
  return buildIcs({ name, events, stamp: new Date() });
}

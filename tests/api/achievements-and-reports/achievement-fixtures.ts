import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import { call, switchService } from '../meeting-recorder/meeting-fixtures';

export { call, switchService };
export {
  colleagueOf,
  treasuryOfficer as achievementOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const READ = 'achievements-and-reports.achievements.read';
export const RECORD = 'achievements-and-reports.achievements.record';
export const MANAGE = 'achievements-and-reports.annual-report.manage';
export const unitPath = (unitId: string) => `/api/achievements-and-reports/units/${unitId}`;
export const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
export const thisYear = () => Number(today().slice(0, 4));

/** The service on for the unit, and the report year starting on 1 January (a fictional test value). */
export async function readyAchievements(unitId: string, actor: string): Promise<void> {
  await switchService('achievements-and-reports', unitId, true);
  await setSetting(env.DB, {
    key: 'achievements-and-reports.report_year_start',
    value: { month: 1, day: 1 },
    actorPersonId: actor,
  });
}

/** A fictional category in the data administrator's list (15 B3). */
export async function addCategory(id: string, nameEn: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at)
     VALUES (?, 'achievement-categories', ?, ?, 1, NULL, NULL, 'now')`,
  )
    .bind(id, nameEn, `${nameEn} (ar)`)
    .run();
}

/** An achievement's details, as the form sends them (O-151). */
export const achievementBody = (p: {
  categoryItemId: string;
  officers: string[];
  date?: string;
  title?: string;
}) => ({
  title: p.title ?? 'Fictional youth award (test)',
  date: p.date ?? today(),
  categoryItemId: p.categoryItemId,
  description: 'Fictional description (test).',
  officerPersonIds: p.officers,
});

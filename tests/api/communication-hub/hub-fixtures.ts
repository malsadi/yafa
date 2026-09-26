import { env } from 'cloudflare:workers';
import { buildTestApp } from '../../app/app-fixtures';

export { call } from '../documents-archive/archive-fixtures';
export {
  colleagueOf,
  treasuryOfficer as hubOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const READ = 'communication-hub.noticeboard.read';
export const MANAGE = 'communication-hub.noticeboard.manage';
export const unitHub = (unitId: string) => `/api/communication-hub/units/${unitId}`;
export const roleOf = (suffix: string) => `01ARZ3NDEKTSV4RRFFQ69AR${suffix}`;

/** Switch the Communication hub on for a unit (8.4). */
export async function readyHub(unitId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('communication-hub', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
  await buildTestApp();
}

/** A notice's text, perhaps with a vote. */
export const noticeBody = (title: string, vote: object | null = null) => ({
  title,
  body: `About ${title}.`,
  vote,
});

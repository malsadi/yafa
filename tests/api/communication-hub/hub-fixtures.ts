import { env } from 'cloudflare:workers';
import { acknowledgeNotice, buildTestApp } from '../../app/app-fixtures';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from '../../core/permissions/permission-fixtures';
import type { Officer } from '../treasury/treasury-fixtures';

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

/**
 * A fictional officer in a unit of their own, holding a role shared across
 * units (a standard role), with these capabilities through it — for role
 * networks (D-158) and conversations across units.
 */
export async function officerInSharedRole(params: {
  suffix: string;
  notice: string;
  roleId: string;
  capabilities: string[];
  unitType?: 'national' | 'branch';
}): Promise<Officer> {
  const { suffix } = params;
  const unitId = `01ARZ3NDEKTSV4RRFFQ69AU${suffix}`;
  const personId = `01ARZ3NDEKTSV4RRFFQ69AP${suffix}`;
  const clerkUserId = `clerk_app_${suffix}`;
  await insertUnit(env.DB, {
    id: unitId,
    type: params.unitType ?? 'branch',
    code: `hub-${suffix}`,
    name: `Unit ${suffix}`,
  });
  if (!(await env.DB.prepare('SELECT 1 FROM roles WHERE id = ?').bind(params.roleId).first()))
    await insertRole(env.DB, { id: params.roleId, name: `Role ${params.roleId}` });
  await insertPerson(env.DB, { id: personId, email: `${suffix}@example.org`, clerkUserId });
  await insertTerm(env.DB, {
    id: `01ARZ3NDEKTSV4RRFFQ69AT${suffix}`,
    personId,
    roleId: params.roleId,
    unitId,
    startDate: '2026-01-01',
  });
  await acknowledgeNotice(personId, params.notice);
  for (const capability of params.capabilities) {
    await insertGrant(env.DB, {
      id: `${capability}-${suffix}`,
      roleId: params.roleId,
      capability,
      scope: 'own unit',
    });
  }
  await readyHub(unitId);
  return { personId, unitId, clerkUserId };
}

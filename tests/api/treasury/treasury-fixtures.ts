import { env } from 'cloudflare:workers';
import { setSetting } from '../../../src/worker/core/settings';
import {
  insertGrant,
  insertPerson,
  insertRole,
  insertTerm,
} from '../../core/permissions/permission-fixtures';
import { acknowledgeNotice, buildTestApp, seedOfficer } from '../../app/app-fixtures';
import { call } from '../documents-archive/archive-fixtures';

export type Officer = Awaited<ReturnType<typeof seedOfficer>>;
export { call };

export const unitPath = (unitId: string) => `/api/treasury/units/${unitId}`;

/** A fictional officer holding these Treasury capabilities in their own unit. */
export async function treasuryOfficer(params: {
  suffix: string;
  notice: string;
  capabilities: string[];
  unitType?: 'national' | 'branch';
}): Promise<Officer> {
  const officer = await seedOfficer({ suffix: params.suffix, unitType: params.unitType });
  await acknowledgeNotice(officer.personId, params.notice);
  for (const capability of params.capabilities) {
    await insertGrant(env.DB, {
      id: `${capability}-${params.suffix}`,
      roleId: `01ARZ3NDEKTSV4RRFFQ69AR${params.suffix}`,
      capability,
      scope: 'own unit',
    });
  }
  return officer;
}

/** A second officer in the same unit, with a role of their own there (7.3: a second officer approves). */
export async function colleagueOf(
  officer: Officer,
  params: { suffix: string; notice: string; capabilities: string[] },
): Promise<Officer> {
  const personId = `01ARZ3NDEKTSV4RRFFQ69AP${params.suffix}`;
  const roleId = `01ARZ3NDEKTSV4RRFFQ69AR${params.suffix}`;
  const clerkUserId = `clerk_app_${params.suffix}`;
  await insertRole(env.DB, { id: roleId, name: `Role ${params.suffix}`, unitId: officer.unitId });
  await insertPerson(env.DB, { id: personId, email: `${params.suffix}@example.org`, clerkUserId });
  await insertTerm(env.DB, {
    id: `01ARZ3NDEKTSV4RRFFQ69AT${params.suffix}`,
    personId,
    roleId,
    unitId: officer.unitId,
    startDate: '2026-01-01',
  });
  await acknowledgeNotice(personId, params.notice);
  for (const capability of params.capabilities) {
    await insertGrant(env.DB, {
      id: `${capability}-${params.suffix}`,
      roleId,
      capability,
      scope: 'own unit',
    });
  }
  return { personId, unitId: officer.unitId, clerkUserId };
}

/** Switch the Treasury on for a unit, and set its settings (17; 8.4). */
export async function readyTreasury(
  unitId: string,
  settings: { thresholdPence: number; receiptRequired: boolean; actor: string },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by) VALUES ('treasury', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
  await buildTestApp();
  for (const [key, value] of [
    ['treasury.approval_threshold', settings.thresholdPence],
    ['treasury.financial_year_start', { month: 4, day: 1 }],
    ['treasury.receipt_required', settings.receiptRequired],
  ] as const) {
    await setSetting(env.DB, { key, value, actorPersonId: settings.actor });
  }
}

/** Open a bank account with an opening balance, returning its id. */
export async function openAccount(
  officer: Officer,
  name: string,
  openingBalancePence: number,
  openingDate = '2026-05-01',
) {
  const res = await call(officer.clerkUserId, 'POST', `${unitPath(officer.unitId)}/accounts`, {
    name,
    branchType: 'bank',
    openingBalancePence,
    openingDate,
  });
  return (await res.json<{ accountId: string }>()).accountId;
}

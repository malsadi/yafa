import { env } from 'cloudflare:workers';
import { setSetting } from '../../../../src/worker/core/settings';
import { acknowledgeNotice, seedOfficer } from '../../../app/app-fixtures';
import { insertGrant } from '../../../core/permissions/permission-fixtures';

export { call } from '../../documents-archive/archive-fixtures';

export const P = '/api/administration-panel';

/** A fictional officer holding these Administration panel capabilities portal-wide (D-046). */
export async function operationsOfficer(params: {
  suffix: string;
  notice: string;
  capabilities: string[];
  unitType?: 'national' | 'branch';
}) {
  const officer = await seedOfficer({ suffix: params.suffix, unitType: params.unitType });
  await acknowledgeNotice(officer.personId, params.notice);
  for (const capability of params.capabilities)
    await insertGrant(env.DB, {
      id: `${capability}-${params.suffix}`,
      roleId: `01ARZ3NDEKTSV4RRFFQ69AR${params.suffix}`,
      capability,
      scope: 'all units',
    });
  return officer;
}

/** A fictional test value for a setting (8.1: none has a default in code). */
export const set = (key: string, value: unknown, actorPersonId: string) =>
  setSetting(env.DB, { key, value, actorPersonId });

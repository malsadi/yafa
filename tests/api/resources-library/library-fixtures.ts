import { env } from 'cloudflare:workers';
import { insertGrant } from '../../core/permissions/permission-fixtures';
import { acknowledgeNotice, seedOfficer } from '../../app/app-fixtures';

export type Officer = Awaited<ReturnType<typeof seedOfficer>>;

/** Switch the library on for one unit (8.4). */
export async function switchLibraryOn(unitId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by)
     VALUES ('resources-library', ?, 1, ?, 'test')`,
  )
    .bind(unitId, new Date().toISOString())
    .run();
}

/** A fictional officer holding these library capabilities in their own unit. */
export async function libraryOfficer(params: {
  suffix: string;
  notice: string;
  capabilities: string[];
  unitType?: 'national' | 'branch';
  libraryOn?: boolean;
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
  if (params.libraryOn ?? true) await switchLibraryOn(officer.unitId);
  return officer;
}

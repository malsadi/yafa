import { buildAuditStatement } from '../../core/audit';
import { ConflictError, NotFoundError } from '../../core/errors';
import type { RequestContext } from '../../core/permissions';
import { requireLibraryCapability, requireWritable } from './library-access';
import { runLibraryBatch } from './library-versioning';

/** D-100: the library's material that is retired and brought back, never deleted. */
export const RETIRABLE = {
  'letter-template': {
    table: 'library_letter_templates',
    capability: 'resources-library.letter-templates.manage',
  },
  resource: { table: 'library_resources', capability: 'resources-library.resources.manage' },
  venue: { table: 'library_venues', capability: 'resources-library.venues.manage' },
  equipment: { table: 'library_equipment', capability: 'resources-library.equipment.manage' },
} as const;

export type Retirable = keyof typeof RETIRABLE;

interface Params {
  unitId: string;
  id: string;
  version: number;
}

/**
 * D-100: retire an item of the unit's, or bring it back, from the version
 * read (9.1), with an audit entry. Another unit's is not found.
 */
export async function setLibraryRetired(
  db: D1Database,
  ctx: RequestContext,
  kind: Retirable,
  params: Params & { retire: boolean },
): Promise<void> {
  const { table, capability } = RETIRABLE[kind];
  requireWritable(await requireLibraryCapability(db, ctx, capability, params.unitId));
  const row = await db
    .prepare(`SELECT unit_id AS unitId, retired_at AS retiredAt FROM ${table} WHERE id = ?`)
    .bind(params.id)
    .first<{ unitId: string; retiredAt: string | null }>();
  if (row?.unitId !== params.unitId) throw new NotFoundError(`resources-library.${kind}-not-found`);
  if (params.retire === (row.retiredAt !== null)) {
    throw new ConflictError(
      params.retire ? 'resources-library.already-retired' : 'resources-library.not-retired',
    );
  }
  const at = new Date().toISOString();
  await runLibraryBatch(db, [
    db
      .prepare(
        `UPDATE ${table} SET retired_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(params.retire ? at : null, params.version + 1, ctx.personId, at, params.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: `${kind}.${params.retire ? 'retired' : 'restored'}`,
      entityType: kind,
      entityId: params.id,
      before: row,
    }),
  ]);
}

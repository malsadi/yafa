import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';

const READ = 'documents-archive.documents.read';

/** Which units' documents this officer sees: every unit, or these. */
export type ArchiveVisibility = { allUnits: true } | { allUnits: false; unitIds: string[] };

/**
 * Brief 15 A5 and 7.3, with P2 (D-095): an officer who may read the archive
 * in their own unit sees that unit's documents and the General Council's;
 * one who may read it in the General Council sees every unit's. Refused
 * when they may read it in none of their units.
 */
export async function archiveVisibilityOf(
  db: D1Database,
  ctx: RequestContext,
): Promise<ArchiveVisibility> {
  const units = await listUnits(db);
  const own = units.filter((unit) => ctx.units.includes(unit.id));
  const reads = await Promise.all(own.map((unit) => can(db, ctx, READ, { unitId: unit.id })));
  const readable = own.filter((_, index) => reads[index]);
  if (readable.length === 0) throw new ForbiddenError('permission.denied');
  if (readable.some((unit) => unit.type === 'national')) return { allUnits: true };
  const national = units.filter((unit) => unit.type === 'national').map((unit) => unit.id);
  return { allUnits: false, unitIds: [...new Set([...readable.map((u) => u.id), ...national])] };
}

export function sees(visibility: ArchiveVisibility, unitId: string): boolean {
  return visibility.allUnits || visibility.unitIds.includes(unitId);
}

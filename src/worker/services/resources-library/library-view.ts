import { can, type RequestContext } from '../../core/permissions';
import { listUnits } from '../committee-register';
import { requireLibraryCapability, sharedWith } from './library-access';

const READ = 'resources-library.library.read';

export interface LibraryView {
  unit: Awaited<ReturnType<typeof requireLibraryCapability>>;
  /** The unit's own, and the General Council's, shared with it (7.3, D-106). */
  unitIds: string[];
  isNational: (unitId: string) => boolean;
  /**
   * Whether an item of `unitId`'s is shown: a live one to every reader; a
   * retired one (D-100) only to whoever manages that unit's, to bring it back.
   */
  shows: (item: { unitId: string; retiredAt: string | null }) => boolean;
}

/** Brief 16 and 7.3: what an officer reading the library in a unit sees. */
export async function libraryView(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  manageCapability: string,
): Promise<LibraryView> {
  const unit = await requireLibraryCapability(db, ctx, READ, unitId);
  const unitIds = await sharedWith(db, unit);
  const national = new Set(
    (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id),
  );
  const manages = new Map<string, boolean>();
  for (const id of unitIds) manages.set(id, await can(db, ctx, manageCapability, { unitId: id }));
  return {
    unit,
    unitIds,
    isNational: (id) => national.has(id),
    shows: (item) =>
      unitIds.includes(item.unitId) &&
      (item.retiredAt === null || manages.get(item.unitId) === true),
  };
}

import type { ListItem } from '../../../../shared/administration-panel/lists';
import { ConflictError, ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';

const CAPABILITY = 'administration-panel.lists.manage';

export async function requireListsCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/**
 * No two items of one list share a name, in either language — retired ones
 * included, since they still name past records (D-070).
 */
export function requireUniqueName(
  items: ListItem[],
  names: { nameEn: string; nameAr: string },
  exceptId?: string,
): void {
  const clash = items.some(
    (item) =>
      item.id !== exceptId &&
      (item.nameEn.toLowerCase() === names.nameEn.toLowerCase() || item.nameAr === names.nameAr),
  );
  if (clash) throw new ConflictError('lists.name-taken');
}

/** D-076: a calendar colour has a colour; an item of any other list has none. */
export function requireColourFits(list: ListItem['list'], colour: string | null): void {
  if ((list === 'calendar-colours') !== (colour !== null)) {
    throw new ConflictError(
      colour === null ? 'lists.colour-required' : 'lists.colour-only-for-calendar-colours',
    );
  }
}

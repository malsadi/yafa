import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { requireLetterUnit, type LetterUnitRow } from '../letter-access';
import { findLetterIn, type LetterInFound } from './letters-in.repo';

/**
 * D-214 (O-135): a letter in, for an officer holding `capability` in its
 * unit — or for the officer handling it, who may see it and move its status
 * without one (D-213 choice: seeing it, so they can act on it).
 */
export async function requireLetterInFor(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; letterId: string; capability: string; handlerMay: boolean },
): Promise<{ unit: LetterUnitRow; letter: LetterInFound }> {
  const unit = await requireLetterUnit(db, params.unitId);
  const letter = await findLetterIn(db, unit.id, params.letterId);
  const holds = await can(db, ctx, params.capability, { unitId: unit.id });
  const handles = params.handlerMay && letter?.handlerPersonId === ctx.personId;
  if (!holds && !handles) throw new ForbiddenError('permission.denied');
  if (!letter) throw new NotFoundError('correspondence-and-letters.letter-not-found');
  return { unit, letter };
}

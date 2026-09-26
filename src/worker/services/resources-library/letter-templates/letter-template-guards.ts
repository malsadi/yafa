import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireLibraryCapability, requireWritable } from '../library-access';
import { findTemplate, type LetterTemplateRow } from './letter-templates.repo';

export const MANAGE = 'resources-library.letter-templates.manage';

/**
 * A template of this unit, which the officer manages there, in a unit whose
 * library is on and can take changes (P4). Another unit's is not found.
 */
export async function requireManagedTemplate(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; templateId: string },
): Promise<LetterTemplateRow> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, params.unitId));
  const template = await findTemplate(db, params.templateId);
  if (template?.unitId !== params.unitId) {
    throw new NotFoundError('resources-library.letter-template-not-found');
  }
  return template;
}

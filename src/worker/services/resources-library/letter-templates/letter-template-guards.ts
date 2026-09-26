import { ConflictError, NotFoundError } from '../../../core/errors';
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

/** Runs a template's batch; a save made from an older version is refused (9.1). */
export async function runTemplateBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale')) {
      throw new ConflictError('resources-library.stale');
    }
    throw error;
  }
}

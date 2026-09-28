import type { WritingChoices } from '../../../../shared/correspondence-and-letters/letter-records';
import { listUnits } from '../../committee-register';
import { requireLibraryUnit, sharedWith } from '../library-access';
import { listTemplatesOf } from './letter-templates.repo';

type UsableTemplate = WritingChoices['templates'][number];

/**
 * Brief 23 A1 and D-214 (O-141): the templates a unit's letters are written
 * from — its own and the General Council's, never a retired one. For the
 * Correspondence service, which checks its own capability first. With the
 * library switched off for the unit, there are none to use (8.4, O-147).
 */
export async function usableLetterTemplates(
  db: D1Database,
  unitId: string,
): Promise<UsableTemplate[]> {
  const unit = await requireLibraryUnit(db, unitId);
  const national = new Set(
    (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id),
  );
  return (await listTemplatesOf(db, await sharedWith(db, unit)))
    .filter((t) => t.retiredAt === null)
    .map((t) => ({
      id: t.id,
      national: national.has(t.unitId),
      title: t.title,
      subject: t.subject,
      body: t.body,
      fields: t.fields,
      language: t.language,
    }));
}

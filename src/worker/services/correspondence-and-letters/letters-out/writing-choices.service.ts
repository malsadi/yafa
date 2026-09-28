import type { WritingChoices } from '../../../../shared/correspondence-and-letters/letter-records';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { usableLetterTemplates } from '../../resources-library';
import { requireLetterCapability, WRITE } from '../letter-access';
import { listAnswerableLettersIn } from '../letters-in/letters-in.repo';
import { personName } from './letter-writing';
import { signerRolesOf } from './letters-out.repo';

/** Brief 23 A1, A2 and D-214: what a writer chooses from — templates, their own roles, and letters to answer. */
export async function writingChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<WritingChoices> {
  const unit = await requireLetterCapability(db, ctx, WRITE, unitId);
  const [templates, signerRoles, signerName, answerable] = await Promise.all([
    usableLetterTemplates(db, unit.id),
    signerRolesOf(db, { personId: ctx.personId, unitId: unit.id, today: getTodayInLondon() }),
    personName(db, ctx.personId),
    listAnswerableLettersIn(db, unit.id),
  ]);
  return {
    templates,
    signerRoles,
    signerName,
    letterheadUnit: {
      nameEn: unit.nameEn,
      nameAr: unit.nameAr,
      addressEn: unit.letterheadAddressEn,
      addressAr: unit.letterheadAddressAr,
    },
    answerable,
  };
}

import type { Language } from '../../../../shared/core/languages';
import {
  buildInsertBranchStatement,
  buildInsertPersonStatement,
  buildInsertTermStatement,
} from '../../committee-register';
import { buildOpenBranchAccountStatement } from '../../treasury';
import type { ImportPlan } from './import-plan';

/** Brief 25 D4: the new units, people, terms and accounts, in the order they depend on each other. */
export function importStatements(
  db: D1Database,
  plan: ImportPlan,
  params: { language: Language; actor: string },
): D1PreparedStatement[] {
  const at = new Date().toISOString();
  return [
    ...plan.units.map((u) =>
      buildInsertBranchStatement(db, {
        ...u,
        type: 'branch',
        letterheadAddressEn: null,
        letterheadAddressAr: null,
        calendarColourId: null,
      }),
    ),
    ...plan.people.map((p) => buildInsertPersonStatement(db, { ...p, language: params.language })),
    ...plan.terms.map((t) => buildInsertTermStatement(db, t)),
    ...plan.accounts.map((a) =>
      buildOpenBranchAccountStatement(db, { ...a, actor: params.actor, at }),
    ),
  ];
}

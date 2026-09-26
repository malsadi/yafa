import type { Language } from '../../../../shared/core/languages';
import type { StatementData } from '../../../../shared/treasury/statement';
import type { StatementDocument } from '../../../../pdf-templates/treasury-statement/statement-document';
import { ServiceUnavailableError } from '../../../core/errors';
import { readBranding } from '../../administration-panel';
import type { TreasuryUnit } from '../treasury-access';
import { statementDocument } from './statement-document';

/**
 * Brief 17 C2 and 9.4: a statement written out for its PDF, headed with
 * the organisation's name in that language — which must be set (8.1).
 */
export async function writtenStatement(
  db: D1Database,
  data: StatementData,
  params: { unit: TreasuryUnit; language: Language },
): Promise<StatementDocument> {
  const { organisationName } = await readBranding(db);
  if (!organisationName) throw new ServiceUnavailableError('setting.not-configured');
  const ar = params.language === 'ar';
  return statementDocument(data, {
    language: params.language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    unitName: ar ? params.unit.nameAr : params.unit.nameEn,
  });
}

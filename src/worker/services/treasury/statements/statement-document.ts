import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { formatMoneyGBP } from '../../../../shared/core/format-money-gbp';
import type { Language } from '../../../../shared/core/languages';
import type { StatementData, StatementLine } from '../../../../shared/treasury/statement';
import type { StatementDocument } from '../../../../pdf-templates/treasury-statement/statement-document';
import { fillText } from '../../../../web/text/fill-text';
import { getTextBundle } from '../../../../web/text';

type Labels = ReturnType<typeof getTextBundle>['services']['treasury']['statementPdf'];

/** What a line records, in words: its type (and whether it is a reversal), who, and what for. */
function details(line: StatementLine, t: Labels): string {
  const account = line.otherAccountName ?? '';
  const type =
    line.type === 'transfer'
      ? fillText(line.inPence > 0 ? t.types.transferIn : t.types.transferOut, { account })
      : t.types[line.type];
  const kind = line.reversal ? fillText(t.reversal, { type }) : type;
  return [kind, line.counterparty, line.description].filter(Boolean).join(' — ');
}

/**
 * Brief 17 C2 and 9.4: a statement written out in the officer's language
 * — its labels from the portal's texts, dates and pounds as that language
 * writes them (D-048: Western digits until that setting exists).
 */
export function statementDocument(
  data: StatementData,
  params: { language: Language; organisationName: string; unitName: string },
): StatementDocument {
  const t = getTextBundle(params.language).services.treasury.statementPdf;
  const locale = buildDisplayLocale(params.language, null);
  const date = (d: string) => formatDateLondon(`${d}T12:00:00Z`, locale, { dateStyle: 'long' });
  const money = (pence: number) => (pence === 0 ? '' : formatMoneyGBP(pence, locale));
  return {
    language: params.language,
    organisationName: params.organisationName,
    unitName: params.unitName,
    title: fillText(t.title, { account: data.accountName }),
    period: fillText(t.period, { from: date(data.from), to: date(data.to) }),
    headings: t.headings,
    opening: { label: t.opening, balance: formatMoneyGBP(data.openingBalancePence, locale) },
    rows: data.lines.map((line) => ({
      date: date(line.entryDate),
      details: details(line, t),
      in: money(line.inPence),
      out: money(line.outPence),
      balance: formatMoneyGBP(line.balancePence, locale),
    })),
    closing: { label: t.closing, balance: formatMoneyGBP(data.closingBalancePence, locale) },
  };
}

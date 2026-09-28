import type { AnnualReportContent } from '../../shared/achievements-and-reports/annual-report';
import { buildDisplayLocale } from '../../shared/core/build-display-locale';
import { formatDateLondon } from '../../shared/core/format-date-london';
import { formatMoneyGBP } from '../../shared/core/format-money-gbp';
import type { Language } from '../../shared/core/languages';
import type { AnnualReportDocument } from './annual-report-document';
import { getTextBundle } from '../../web/text';
import { fillText } from '../../web/text/fill-text';

type Texts = ReturnType<typeof getTextBundle>;
type Section = AnnualReportDocument['sections'][number];

/** O-160: a section whose service was switched off says so; an empty one says there were none. */
function sectionOf<T>(
  heading: string,
  items: T[] | null,
  line: (item: T) => string,
  words: { none: string; notInUse: string },
): Section {
  if (items === null) return { heading, lines: [words.notInUse] };
  return { heading, lines: items.length ? items.map(line) : [words.none] };
}

/**
 * P18 and O-155: the Treasury's year, marked provisional while it is open.
 * Transfers between the unit's own accounts cancel out in its totals, so
 * they are not listed (D-213 choice).
 */
function treasuryLines(
  content: AnnualReportContent,
  t: Texts,
  locale: string,
  date: (d: string) => string,
) {
  const r = t.services['achievements-and-reports'].reportPdf;
  const s = content.treasury;
  if (!s) return null;
  const money = (pence: number) => formatMoneyGBP(pence, locale);
  const f = s.totals;
  return [
    ...(s.closed ? [] : [r.provisional]),
    fillText(r.treasuryYear, { start: date(s.start), end: date(s.end) }),
    fillText(r.startBalance, { amount: money(f.startBalancePence) }),
    ...(f.openingBalancesPence
      ? [fillText(r.openingBalances, { amount: money(f.openingBalancesPence) })]
      : []),
    fillText(r.credits, { amount: money(f.creditsPence) }),
    fillText(r.debits, { amount: money(f.debitsPence) }),
    fillText(r.endBalance, { amount: money(f.endBalancePence) }),
  ];
}

interface Writing {
  t: Texts;
  ar: boolean;
  date: (d: string) => string;
  locale: string;
}

/** The report's sections, each in the officer's language (24 B2; O-160). */
function reportSections(content: AnnualReportContent, w: Writing): Section[] {
  const r = w.t.services['achievements-and-reports'].reportPdf;
  const { ar, date } = w;
  const plain = { none: r.none, notInUse: '' };
  const words = (service: 'event-organiser' | 'meeting-recorder' | 'treasury') => ({
    none: r.none,
    notInUse: fillText(r.notInUse, { service: w.t.services[service].name }),
  });
  const achievement = (a: AnnualReportContent['achievements'][number]) =>
    fillText(r.achievementLine, {
      date: date(a.date),
      title: a.title,
      category: (ar ? a.categoryNameAr : a.categoryNameEn) ?? '',
      officers: a.officers.join(r.listSeparator),
    });
  return [
    ...(content.summary ? [{ heading: r.summary, lines: [content.summary] }] : []),
    sectionOf(r.achievements, content.achievements, achievement, plain),
    sectionOf(
      r.events,
      content.events,
      (e) => fillText(r.eventLine, { date: date(e.completedOn), name: e.name }),
      words('event-organiser'),
    ),
    sectionOf(
      r.meetings,
      content.meetings,
      (m) =>
        fillText(r.meetingLine, { date: date(m.date), type: ar ? m.typeNameAr : m.typeNameEn }),
      words('meeting-recorder'),
    ),
    {
      heading: r.treasury,
      lines: treasuryLines(content, w.t, w.locale, date) ?? [words('treasury').notInUse],
    },
    sectionOf(
      r.officers,
      content.officers,
      (o) => fillText(r.officerLine, { name: o.name, role: ar ? o.roleNameAr : o.roleNameEn }),
      plain,
    ),
  ];
}

/**
 * Brief 24 B2 and 9.4: the report written out in one language — for its
 * PDF, in the finalising officer's language, and on screen, in the reader's.
 */
export function annualReportDocument(
  content: AnnualReportContent,
  params: { language: Language; organisationName: string },
): AnnualReportDocument {
  const t = getTextBundle(params.language);
  const r = t.services['achievements-and-reports'].reportPdf;
  const ar = params.language === 'ar';
  const locale = buildDisplayLocale(params.language, null);
  const date = (d: string) => formatDateLondon(`${d}T12:00:00Z`, locale, { dateStyle: 'long' });
  const unitName = ar ? content.unitNameAr : content.unitNameEn;
  return {
    language: params.language,
    organisationName: params.organisationName,
    unitName,
    title: fillText(r.title, { year: String(content.year), unit: unitName }),
    details: [
      fillText(r.period, { start: date(content.periodStart), end: date(content.periodEnd) }),
    ],
    sections: reportSections(content, { t, ar, date, locale }),
  };
}

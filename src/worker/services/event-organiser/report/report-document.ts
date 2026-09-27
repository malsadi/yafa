import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { formatMoneyGBP } from '../../../../shared/core/format-money-gbp';
import type { Language } from '../../../../shared/core/languages';
import type { PostEventReport } from '../../../../shared/event-organiser/post-event-report';
import type { ReportDocument } from '../../../../pdf-templates/post-event-report/report-document';
import { getTextBundle } from '../../../../web/text';
import { fillText } from '../../../../web/text/fill-text';

/**
 * Brief 21 C1, 9.4 and D-183: the report written out in the closing
 * officer's language — its labels from the portal's texts, dates and
 * pounds as that language writes them.
 */
export function reportDocument(
  report: PostEventReport,
  params: { language: Language; organisationName: string; unitName: string },
): ReportDocument {
  const bundle = getTextBundle(params.language);
  const t = bundle.services['event-organiser'].reportPdf;
  const statuses = bundle.services['task-tracker'].statuses;
  const locale = buildDisplayLocale(params.language, null);
  const date = (d: string) => formatDateLondon(`${d}T12:00:00Z`, locale, { dateStyle: 'long' });
  const money = (pence: number) => formatMoneyGBP(pence, locale);
  const { event } = report;
  const ar = params.language === 'ar';
  const dates = event.lastDay
    ? `${date(event.firstDay)} – ${date(event.lastDay)}`
    : date(event.firstDay);
  return {
    language: params.language,
    organisationName: params.organisationName,
    unitName: params.unitName,
    title: fillText(report.cancelled ? t.titleCancelled : t.title, { name: event.name }),
    details: [
      fillText(t.dates, { dates }),
      fillText(t.type, { type: ar ? event.typeNameAr : event.typeNameEn }),
      fillText(t.lead, { name: event.leadName ?? '' }),
      ...(report.cancelled ? [fillText(t.cancelReason, { reason: event.cancelReason ?? '' })] : []),
    ],
    tasks: {
      heading: t.tasksHeading,
      summary: fillText(t.tasksSummary, {
        done: String(report.tasks.done),
        total: String(report.tasks.total),
      }),
      headings: t.taskHeadings,
      rows: report.tasks.items.map((item) => ({ task: item.title, status: statuses[item.status] })),
    },
    budget: budgetSection(t, report.budget, money),
  };
}

type Labels = ReturnType<typeof getTextBundle>['services']['event-organiser']['reportPdf'];

/** P10 and D-183: each budget line against actual income and spending, "Unallocated", the totals and balance. */
function budgetSection(
  t: Labels,
  budget: PostEventReport['budget'],
  money: (pence: number) => string,
): ReportDocument['budget'] {
  const row = (
    line: string,
    f: { budgetPence: number; incomePence: number; spendingPence: number },
  ) => ({
    line,
    budget: money(f.budgetPence),
    income: money(f.incomePence),
    spending: money(f.spendingPence),
  });
  return {
    heading: t.budgetHeading,
    headings: t.budgetHeadings,
    rows: [
      ...budget.lines.map((line) => row(line.name, line)),
      row(t.unallocated, { budgetPence: 0, ...budget.unallocated }),
    ],
    totals: row(t.totals, budget.totals),
    balance: { label: t.balance, amount: money(budget.balancePence) },
  };
}

import type { FinancialYearRecord } from '../../../shared/treasury/treasury-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { useTreasuryAction } from './use-treasury-action';

/** Brief 17 C3 and D-128: one financial year — closed, or open and whether it can close now. */
export function YearRow({ unitId, year }: { unitId: string; year: FinancialYearRecord }) {
  const t = useText().services.treasury;
  const { language } = useLanguage();
  const { context } = useActiveSession();
  const date = useFormatDate();
  const when = useFormatTimestamp();
  const close = useTreasuryAction(unitId);
  const closable =
    !year.closed &&
    year.ended &&
    year.awaitingCount === 0 &&
    context.capabilities.includes('treasury.year-end.close');
  const state = year.closed
    ? fillText(year.closedByName ? t.years.closed : t.years.closedNoName, {
        name: year.closedByName ?? '',
        date: when(year.closedAt ?? ''),
      })
    : [
        t.years.open,
        !year.ended && t.years.notEnded,
        year.awaitingCount > 0 && fillText(t.years.awaiting, { count: year.awaitingCount }),
      ]
        .filter(Boolean)
        .join(' · ');
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p className="font-medium">
        {fillText(t.years.period, { start: date(year.start), end: date(year.end) })}
      </p>
      <p className="text-sm">{state}</p>
      <ErrorAlert error={close.error} refusals={t.refusals} />
      {closable && (
        <button
          type="button"
          disabled={close.isPending}
          className="self-start rounded bg-slate-800 px-3 py-1 text-white"
          onClick={() => {
            if (window.confirm(t.years.confirm))
              close.mutate({
                path: '/financial-years/close',
                body: { start: year.start, language },
              });
          }}
        >
          {t.years.close}
        </button>
      )}
    </li>
  );
}

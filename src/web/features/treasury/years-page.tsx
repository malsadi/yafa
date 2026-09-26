import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { useTreasuryUnit } from './use-treasury-unit';
import { useYears } from './use-years';
import { YearRow } from './year-row';

/** Brief 17 C3 and D-128: the unit's financial years, newest first, and closing them in order. */
export function YearsPage() {
  const unitId = useTreasuryUnit();
  const text = useText();
  const t = text.services.treasury;
  const years = useYears(unitId);
  if (years.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (years.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.years.heading}</h2>
      <p className="text-sm text-slate-600">{t.years.explanation}</p>
      <ul className="flex flex-col gap-2">
        {years.data.map((year) => (
          <YearRow key={year.start} unitId={unitId} year={year} />
        ))}
      </ul>
    </section>
  );
}

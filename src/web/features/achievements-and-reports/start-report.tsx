import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { SelectField } from '../../components/select-field';
import { fillText } from '../../text/fill-text';
import { unitPath } from './achievements.api';
import { useAchievementAction } from './use-achievement-queries';

/** O-157 and D-216: any ended year without a report can be started — the latest first. */
export function StartReport(props: { unitId: string; years: number[] }) {
  const t = useText().services['achievements-and-reports'];
  const navigate = useNavigate();
  const start = useAchievementAction<{ id: string }>();
  const [year, setYear] = useState(String(props.years[0] ?? ''));
  if (props.years.length === 0) return null;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start.mutate(
          {
            path: `${unitPath(props.unitId)}/annual-reports`,
            method: 'POST',
            body: { year: Number(year) },
          },
          {
            onSuccess: ({ id }) => void navigate(`/achievements-and-reports/annual-reports/${id}`),
          },
        );
      }}
    >
      <SelectField
        label={t.reports.year}
        value={year}
        options={props.years.map((y) => ({ value: String(y), label: String(y) }))}
        onChange={setYear}
      />
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
        disabled={start.isPending}
      >
        {fillText(t.reports.start, { year })}
      </button>
      <ErrorAlert error={start.error} refusals={t.refusals} />
    </form>
  );
}

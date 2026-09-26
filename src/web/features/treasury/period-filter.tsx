import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';

export interface Period {
  from: string;
  to: string;
}

/** Brief 17 C2: a period — from and to, either left open. */
export function PeriodFilter(props: {
  initial: Period;
  submit: string;
  onApply: (period: Period) => void;
}) {
  const t = useText().services.treasury.entries.period;
  const [period, setPeriod] = useState(props.initial);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onApply(period);
      }}
    >
      <TextField
        label={t.from}
        type="date"
        value={period.from}
        onChange={(from) => {
          setPeriod((p) => ({ ...p, from }));
        }}
        optional
      />
      <TextField
        label={t.to}
        type="date"
        value={period.to}
        onChange={(to) => {
          setPeriod((p) => ({ ...p, to }));
        }}
        optional
      />
      <button type="submit" className="rounded border border-slate-400 px-3 py-2">
        {props.submit}
      </button>
    </form>
  );
}

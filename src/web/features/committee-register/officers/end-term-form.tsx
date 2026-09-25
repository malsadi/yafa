import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';

interface EndTermFormProps {
  busy: boolean;
  onEnd: (endDate: string) => void;
  onCancel: () => void;
}

/** Brief 14 B3 and C3: end a term on a date; the officer then becomes a past officer. */
export function EndTermForm(props: EndTermFormProps) {
  const t = useText().services['committee-register'].register;
  const [endDate, setEndDate] = useState('');
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onEnd(endDate);
      }}
    >
      <TextField label={t.endDate} type="date" value={endDate} onChange={setEndDate} />
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
        disabled={props.busy}
      >
        {t.endTerm}
      </button>
      <button type="button" className="rounded border px-3 py-2" onClick={props.onCancel}>
        {t.cancel}
      </button>
    </form>
  );
}

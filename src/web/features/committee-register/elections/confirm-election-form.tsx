import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';

interface ConfirmElectionFormProps {
  electionDate: string;
  busy: boolean;
  onConfirm: (termsStartDate: string) => void;
}

/**
 * Brief 14 C1 and D-066: confirm the results. New terms start on the date
 * entered here, which starts as the election date (the owner's words:
 * "defaulting to the election date"). Once confirmed, it is locked.
 */
export function ConfirmElectionForm({ electionDate, busy, onConfirm }: ConfirmElectionFormProps) {
  const t = useText().services['committee-register'].elections;
  const [startDate, setStartDate] = useState(electionDate);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm(startDate);
      }}
    >
      <p className="max-w-prose">{t.confirmExplanation}</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" required />
        <span>{t.confirmChecked}</span>
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <TextField label={t.termsStartDate} type="date" value={startDate} onChange={setStartDate} />
        <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={busy}>
          {t.confirm}
        </button>
      </div>
    </form>
  );
}

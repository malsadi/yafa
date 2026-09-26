import { useState } from 'react';
import type { ElectionSummary } from '../../../../shared/committee-register/election-record';
import { ElectionStatus } from '../../../../shared/committee-register/election-status';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import { useFormatDate } from '../../../app/language/use-format-date';

interface RecordElectionFormProps {
  elections: ElectionSummary[];
  busy: boolean;
  onRecord: (input: { electionDate: string; correctsElectionId?: string }) => void;
}

/** Brief 14 C1 and D-066: start a Draft, optionally as the correction of a confirmed election. */
export function RecordElectionForm({ elections, busy, onRecord }: RecordElectionFormProps) {
  const t = useText().services['committee-register'].elections;
  const formatDate = useFormatDate();
  const [electionDate, setElectionDate] = useState('');
  const [corrects, setCorrects] = useState('');
  const confirmed = elections.filter((e) => e.status === ElectionStatus.Confirmed);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onRecord(corrects ? { electionDate, correctsElectionId: corrects } : { electionDate });
      }}
    >
      <TextField
        label={t.electionDate}
        type="date"
        value={electionDate}
        onChange={setElectionDate}
      />
      {confirmed.length > 0 && (
        <label className="flex flex-col gap-1">
          <span>{t.corrects}</span>
          <select
            className="rounded border border-slate-400 p-2"
            value={corrects}
            onChange={(event) => {
              setCorrects(event.target.value);
            }}
          >
            <option value="">{t.notACorrection}</option>
            {confirmed.map((e) => (
              <option key={e.id} value={e.id}>
                {formatDate(e.electionDate)}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={busy}>
        {t.record}
      </button>
    </form>
  );
}

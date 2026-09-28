import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { RecordingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FileField } from '../../components/file-field';
import { RecordLetterFields } from './record-letter-fields';
import { useRecordLetter, type LetterInDetails } from './use-record-letter';

const EMPTY: LetterInDetails = {
  dateReceived: '',
  sender: '',
  subject: '',
  handlerPersonId: '',
  answersLetterOutId: '',
};

/** Brief 23 B3 and D-214 (O-143): a letter received, logged with its scan or photo. */
export function RecordLetterForm(props: { unitId: string; choices: RecordingChoices }) {
  const t = useText().services['correspondence-and-letters'];
  const navigate = useNavigate();
  const record = useRecordLetter(props.unitId);
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState(EMPTY);
  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (file)
          record.mutate(
            { file, details },
            {
              onSuccess: ({ id }) => void navigate(`/correspondence-and-letters/letters-in/${id}`),
            },
          );
      }}
    >
      <FileField label={t.record.file} onFile={setFile} />
      <p className="text-sm text-slate-600">{t.record.fileHint}</p>
      <RecordLetterFields
        details={details}
        choices={props.choices}
        set={(change) => {
          setDetails({ ...details, ...change });
        }}
      />
      <ErrorAlert error={record.error} refusals={t.refusals} />
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={record.isPending}
      >
        {record.isPending ? t.record.saving : t.record.save}
      </button>
    </form>
  );
}

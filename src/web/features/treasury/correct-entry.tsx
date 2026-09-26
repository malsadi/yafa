import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';
import { useTreasuryAction } from './use-treasury-action';

/** Brief 17 B6 and D-126: undo an entry with a reversing entry dated today; the right one is recorded afresh. */
export function CorrectEntry({ unitId, entryId }: { unitId: string; entryId: string }) {
  const t = useText().services.treasury;
  const reverse = useTreasuryAction(unitId);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  if (!open) {
    return (
      <button
        type="button"
        className="underline"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t.entries.correct}
      </button>
    );
  }
  return (
    <form
      className="flex w-full flex-col gap-2 rounded bg-slate-50 p-2"
      onSubmit={(event) => {
        event.preventDefault();
        reverse.mutate(
          { path: `/entries/${entryId}/reverse`, body: { description: note } },
          {
            onSuccess: () => {
              setOpen(false);
            },
          },
        );
      }}
    >
      <p className="text-sm">{t.entries.correctExplanation}</p>
      <ErrorAlert error={reverse.error} refusals={t.refusals} />
      <TextField label={t.entries.correctNote} value={note} onChange={setNote} optional />
      <FormButtons
        submit={t.entries.confirmCorrect}
        cancel={t.entries.cancel}
        busy={reverse.isPending}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </form>
  );
}

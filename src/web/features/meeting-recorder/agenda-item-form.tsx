import { useState } from 'react';
import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';
import { useMeetingAction } from './use-meeting-action';

/** D-204: an agenda item's title and optional note — new, or changed from the version read. */
export function AgendaItemForm(props: {
  path: string;
  item?: AgendaItemRecord;
  onDone: () => void;
}) {
  const t = useText().services['meeting-recorder'];
  const save = useMeetingAction();
  const [title, setTitle] = useState(props.item?.title ?? '');
  const [note, setNote] = useState(props.item?.note ?? '');
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const item = { title, note };
        save.mutate(
          props.item
            ? { path: props.path, method: 'PUT', body: { item, version: props.item.version } }
            : { path: props.path, method: 'POST', body: item },
          { onSuccess: props.onDone },
        );
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <TextField label={t.agenda.title} value={title} onChange={setTitle} />
      <TextField label={t.agenda.note} optional value={note} onChange={setNote} />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}

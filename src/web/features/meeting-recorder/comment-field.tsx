import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { RecordedFor } from './recorded-for';
import { useCommentSave } from './use-comment-save';

/**
 * Brief 22 B1 and D-205, D-207: one present officer's comment under an
 * item, saving itself. If someone else's save crossed it, their text is
 * shown and the officer's own stays in the box, so nothing is lost.
 */
export function CommentField(props: {
  path: string;
  name: string;
  current: AgendaItemRecord['comments'][number] | undefined;
  autosaveSeconds: number | null;
}) {
  const t = useText().services['meeting-recorder'];
  const c = useCommentSave({
    path: props.path,
    current: props.current,
    seconds: props.autosaveSeconds,
  });
  const unchanged = c.text === c.saved;
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{props.name}</span>
        <textarea
          className="rounded border border-slate-400 p-2"
          rows={2}
          value={c.text}
          onChange={(e) => {
            c.setText(e.target.value);
          }}
        />
      </label>
      {props.current && <RecordedFor comment={props.current} />}
      <ErrorAlert error={c.save.error} refusals={t.refusals} />
      {c.crossed && (
        <p className="text-sm text-slate-600">{`${t.minutes.theirs} ${props.current?.comment ?? ''}`}</p>
      )}
      <ActionButton
        label={unchanged ? t.minutes.saved : t.minutes.save}
        disabled={c.save.isPending || unchanged}
        onClick={c.send}
      />
    </div>
  );
}

import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/**
 * D-211: a comment is recorded by the chair or secretary on the officer's
 * behalf — said under it, so nobody reads it as written by that officer.
 */
export function RecordedFor(props: { comment: AgendaItemRecord['comments'][number] }) {
  const t = useText().services['meeting-recorder'].reportPdf;
  return (
    <p className="text-xs text-slate-600">
      {fillText(t.recordedFor, {
        officer: props.comment.name ?? '',
        recorder: props.comment.recordedByName ?? '',
      })}
    </p>
  );
}

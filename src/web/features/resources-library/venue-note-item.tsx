import type { VenueNoteRecord } from '../../../shared/resources-library/venue';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** D-098 and D-107: one note — who wrote it and when; it can be retired, never changed. */
export function VenueNoteItem(props: { note: VenueNoteRecord; onRetire: (() => void) | null }) {
  const t = useText().services['resources-library'].venues;
  const formatTimestamp = useFormatTimestamp();
  const { note } = props;
  const date = formatTimestamp(note.writtenAt);
  return (
    <li className="rounded bg-slate-50 p-2 text-sm">
      <p className="whitespace-pre-line">{note.text}</p>
      <p className="text-slate-600">
        {note.writtenByName
          ? fillText(t.noteBy, { name: note.writtenByName, date })
          : fillText(t.noteOn, { date })}
      </p>
      {props.onRetire && (
        <button type="button" className="underline" onClick={props.onRetire}>
          {t.retireNote}
        </button>
      )}
    </li>
  );
}

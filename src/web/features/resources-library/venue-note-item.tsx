import type { VenueNoteRecord } from '../../../shared/resources-library/venue';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/**
 * D-098, D-107 and D-114: one note — who wrote it and when. Never changed;
 * the venue's managers can retire it, or bring a retired one back.
 */
export function VenueNoteItem(props: {
  note: VenueNoteRecord;
  onSetRetired: ((retire: boolean) => void) | null;
}) {
  const t = useText().services['resources-library'].venues;
  const formatTimestamp = useFormatTimestamp();
  const { note, onSetRetired } = props;
  const date = formatTimestamp(note.writtenAt);
  const retired = note.retiredAt !== null;
  return (
    <li className={`rounded p-2 text-sm ${retired ? 'bg-amber-50' : 'bg-slate-50'}`}>
      {retired && <p className="font-medium">{t.noteRetired}</p>}
      <p className="whitespace-pre-line">{note.text}</p>
      <p className="text-slate-600">
        {note.writtenByName
          ? fillText(t.noteBy, { name: note.writtenByName, date })
          : fillText(t.noteOn, { date })}
      </p>
      {onSetRetired && (
        <button
          type="button"
          className="underline"
          onClick={() => {
            onSetRetired(!retired);
          }}
        >
          {retired ? t.restoreNote : t.retireNote}
        </button>
      )}
    </li>
  );
}

import type { EventFileRecord } from '../../../shared/event-organiser/event-file-uses';
import { useText } from '../../app/language/use-text';
import { ActionButton } from './action-button';

/**
 * Brief 21 F1, F2 and D-196: one section's files, each downloaded by its
 * name. Before close, a file is removed (retired: hidden, kept) and a
 * removed one brought back; only its lead officer and managers see those.
 */
export function EventFileList(props: {
  files: EventFileRecord[];
  manages: boolean;
  busy: boolean;
  onDownload: (file: EventFileRecord) => void;
  onRetire: (file: EventFileRecord, retire: boolean) => void;
}) {
  const t = useText().services['event-organiser'].files;
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {props.files.map((f) => {
        const retired = f.retiredAt !== null;
        return (
          <li
            key={f.fileId}
            className={`flex flex-wrap items-center gap-2 ${retired ? 'text-slate-500' : ''}`}
          >
            <button
              type="button"
              className="underline"
              onClick={() => {
                props.onDownload(f);
              }}
            >
              {f.fileName}
            </button>
            <span className="text-slate-600">{f.addedByName}</span>
            {retired && <span className="rounded bg-slate-100 px-2">{t.retired}</span>}
            {props.manages && (
              <ActionButton
                label={retired ? t.restore : t.remove}
                disabled={props.busy}
                onClick={() => {
                  props.onRetire(f, !retired);
                }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

import type { EventFileRecord } from '../../../shared/event-organiser/event-file-uses';
import { ActionButton } from './action-button';

/** Brief 21 F1, F2: one section's files — each downloaded by its name; removable before close (D-185). */
export function EventFileList(props: {
  files: EventFileRecord[];
  removeLabel: string | null;
  busy: boolean;
  onDownload: (file: EventFileRecord) => void;
  onRemove: (file: EventFileRecord) => void;
}) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {props.files.map((f) => (
        <li key={f.fileId} className="flex flex-wrap items-center gap-2">
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
          {props.removeLabel !== null && (
            <ActionButton
              label={props.removeLabel}
              disabled={props.busy}
              onClick={() => {
                props.onRemove(f);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

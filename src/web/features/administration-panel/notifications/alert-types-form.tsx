import { useState } from 'react';
import {
  ALERT_TYPES_ALWAYS_ON,
  SWITCHABLE_ALERT_TYPES,
  type AlertType,
} from '../../../../shared/communication-hub/alert-types';
import { useText } from '../../../app/language/use-text';

interface AlertTypesFormProps {
  /** Null while not set: nothing is ticked (rule 5). */
  chosen: AlertType[] | null;
  busy: boolean;
  onSave: (types: AlertType[]) => void;
}

/** Brief 20 C1 and 25 C4: the alerts a new officer starts with; national circulars are always on. */
export function AlertTypesForm({ chosen, busy, onSave }: AlertTypesFormProps) {
  const text = useText();
  const hub = text.services['communication-hub'];
  const t = text.services['administration-panel'].notifications;
  const [types, setTypes] = useState<AlertType[]>(chosen ?? []);
  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(types);
      }}
    >
      {chosen === null && <p className="text-sm text-amber-800">{t.notSetYet}</p>}
      {ALERT_TYPES_ALWAYS_ON.map((type) => (
        <label key={type} className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" checked disabled />
          {hub.alertTypes[type]} ({t.alwaysOn})
        </label>
      ))}
      {SWITCHABLE_ALERT_TYPES.map((type) => (
        <label key={type} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={types.includes(type)}
            onChange={(event) => {
              setTypes((now) =>
                event.target.checked ? [...now, type] : now.filter((x) => x !== type),
              );
            }}
          />
          {hub.alertTypes[type]}
        </label>
      ))}
      <button
        type="submit"
        className="mt-2 self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={busy}
      >
        {t.save}
      </button>
    </form>
  );
}

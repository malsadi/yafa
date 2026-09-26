import {
  ALERT_TYPES_ALWAYS_ON,
  SWITCHABLE_ALERT_TYPES,
  type SwitchableAlertType,
} from '../../../shared/communication-hub/alert-types';
import { useText } from '../../app/language/use-text';

/** Brief 20 C2 and rules: each alert type on or off — national circulars shown always on. */
export function AlertTypeCheckboxes(props: {
  chosen: SwitchableAlertType[];
  onChange: (chosen: SwitchableAlertType[]) => void;
}) {
  const t = useText().services['communication-hub'];
  return (
    <fieldset className="flex flex-col gap-1">
      {SWITCHABLE_ALERT_TYPES.map((type) => (
        <label key={type} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.chosen.includes(type)}
            onChange={(event) => {
              props.onChange(
                event.target.checked
                  ? [...props.chosen, type]
                  : props.chosen.filter((c) => c !== type),
              );
            }}
          />
          {t.alertTypes[type]}
        </label>
      ))}
      {ALERT_TYPES_ALWAYS_ON.map((type) => (
        <label key={type} className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" checked disabled />
          {t.alertTypes[type]} ({t.alertSettings.alwaysOn})
        </label>
      ))}
    </fieldset>
  );
}

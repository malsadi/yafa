import type { UnitInput } from '../../../../shared/committee-register/unit-record';
import { useText } from '../../../app/language/use-text';

interface UnitStatusSelectProps {
  value: UnitInput['status'] | '';
  onChange: (value: string) => void;
}

/** A branch's status (P4), chosen by the officer — never preselected for a new branch. */
export function UnitStatusSelect(props: UnitStatusSelectProps) {
  const t = useText().services['administration-panel'].units;
  return (
    <label className="flex flex-col gap-1">
      <span>{t.status}</span>
      <select
        className="rounded border border-slate-400 p-2"
        required
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      >
        <option value="" disabled>
          {t.chooseStatus}
        </option>
        <option value="active">{t.statuses.active}</option>
        <option value="inactive">{t.statuses.inactive}</option>
      </select>
    </label>
  );
}

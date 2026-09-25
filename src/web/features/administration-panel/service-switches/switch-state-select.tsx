import { useText } from '../../../app/language/use-text';
import type { SwitchChoice } from './switch-choice';

interface SwitchStateSelectProps {
  label: string;
  value: SwitchChoice;
  /** A unit may follow the portal-wide value; the portal-wide value is on or off. */
  canFollow: boolean;
  busy: boolean;
  onChange: (value: SwitchChoice) => void;
}

/** On, off, or (for a unit) following the portal-wide value. */
export function SwitchStateSelect({
  label,
  value,
  canFollow,
  busy,
  onChange,
}: SwitchStateSelectProps) {
  const t = useText().services['administration-panel'].serviceSwitches;
  return (
    <select
      aria-label={label}
      className="rounded border border-slate-400 p-2"
      value={value}
      disabled={busy}
      onChange={(event) => {
        onChange(event.target.value as SwitchChoice);
      }}
    >
      {canFollow && <option value="follow">{t.follow}</option>}
      <option value="on">{t.on}</option>
      <option value="off">{t.off}</option>
    </select>
  );
}

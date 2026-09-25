import { useState } from 'react';
import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { toEnabled } from './switch-choice';
import { SwitchStateSelect } from './switch-state-select';

interface AddUnitSwitchProps {
  serviceName: string;
  /** The units still following the portal-wide value. */
  units: NamedChoice[];
  busy: boolean;
  onChange: (enabled: boolean | null, unitId: string) => void;
}

/** Give a unit its own on or off: choose the unit, then on or off. */
export function AddUnitSwitch({ serviceName, units, busy, onChange }: AddUnitSwitchProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].serviceSwitches;
  const [adding, setAdding] = useState('');
  const added = units.find((u) => u.id === adding);
  return (
    <label className="flex flex-wrap items-center gap-2">
      <span>{t.addUnit}</span>
      <select
        aria-label={fillText(t.addUnitOf, { service: serviceName })}
        className="rounded border border-slate-400 p-2"
        value={adding}
        disabled={busy}
        onChange={(e) => {
          setAdding(e.target.value);
        }}
      >
        <option value="">{t.chooseUnit}</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {{ en: u.nameEn, ar: u.nameAr }[language]}
          </option>
        ))}
      </select>
      {added && (
        <SwitchStateSelect
          label={fillText(t.unitOf, {
            unit: { en: added.nameEn, ar: added.nameAr }[language],
            service: serviceName,
          })}
          value="follow"
          canFollow
          busy={busy}
          onChange={(v) => {
            if (v !== 'follow') onChange(toEnabled(v), added.id);
            setAdding('');
          }}
        />
      )}
    </label>
  );
}

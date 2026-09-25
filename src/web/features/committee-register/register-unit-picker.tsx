import type { UnitRecord } from '../../../shared/committee-register/unit-record';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';

interface RegisterUnitPickerProps {
  units: UnitRecord[];
  value: string;
  onChange: (unitId: string) => void;
}

/** The unit whose register is open, among those the officer may read (T-102). */
export function RegisterUnitPicker({ units, value, onChange }: RegisterUnitPickerProps) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].register;
  return (
    <label className="flex flex-col gap-1">
      <span>{t.unit}</span>
      <select
        className="max-w-md rounded border border-slate-400 p-2"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {{ en: u.nameEn, ar: u.nameAr }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}

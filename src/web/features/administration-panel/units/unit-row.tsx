import { useState } from 'react';
import type { UnitInput, UnitRecord } from '../../../../shared/committee-register/unit-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { UnitForm, type UnitFormState } from './unit-form';

interface UnitRowProps {
  unit: UnitRecord;
  busy: boolean;
  onSave: (changes: Partial<UnitInput>) => void;
}

function formStateOf(unit: UnitRecord): UnitFormState {
  const { code, nameEn, nameAr, status } = unit;
  return {
    code,
    nameEn,
    nameAr,
    area: unit.area ?? '',
    status,
    letterheadAddressEn: unit.letterheadAddressEn ?? '',
    letterheadAddressAr: unit.letterheadAddressAr ?? '',
    calendarColourId: unit.calendarColourId ?? '',
  };
}

/** Brief 25 B1: one unit, shown, or open for editing. */
export function UnitRow({ unit, busy, onSave }: UnitRowProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].units;
  const [editing, setEditing] = useState(false);
  const name = { en: unit.nameEn, ar: unit.nameAr }[language];
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-slate-600">
            {[unit.code, unit.area, t.statuses[unit.status]].filter(Boolean).join(' · ')}
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            aria-label={fillText(t.editUnit, { name })}
            onClick={() => {
              setEditing(true);
            }}
          >
            {t.edit}
          </button>
        )}
      </div>
      {editing && (
        <UnitForm
          initial={formStateOf(unit)}
          isNational={unit.type === 'national'}
          busy={busy}
          submitLabel={t.save}
          onSubmit={(changes) => {
            onSave(changes);
            setEditing(false);
          }}
          onCancel={() => {
            setEditing(false);
          }}
        />
      )}
    </li>
  );
}

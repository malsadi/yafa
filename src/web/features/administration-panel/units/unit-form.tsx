import { useState } from 'react';
import type { UnitInput } from '../../../../shared/committee-register/unit-record';
import { useText } from '../../../app/language/use-text';
import { UnitFormField } from './unit-form-field';
import { UnitStatusSelect } from './unit-status-select';

/** The General Council's fields: it has no area and is always active. */
export type NationalUnitInput = Omit<UnitInput, 'area' | 'status'>;

/** A new branch's status starts unchosen: the officer picks it. */
export type UnitFormState = Omit<UnitInput, 'status'> & { status: UnitInput['status'] | '' };

interface UnitFormProps {
  initial: UnitFormState;
  /** The General Council has no area and is always active. */
  isNational: boolean;
  busy: boolean;
  submitLabel: string;
  onSubmit: (input: UnitInput | NationalUnitInput) => void;
  onCancel?: () => void;
}

/** Brief 14 A1 and 25 B1: a unit's code, names, area and status. */
export function UnitForm(props: UnitFormProps) {
  const t = useText().services['administration-panel'].units;
  const [input, setInput] = useState(props.initial);
  const set = (field: keyof UnitFormState) => (value: string) => {
    setInput((current) => ({ ...current, [field]: value }));
  };
  const { area, status, ...always } = input;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (props.isNational) props.onSubmit(always);
        else if (status !== '') props.onSubmit({ ...always, area, status });
      }}
    >
      <UnitFormField label={t.code} value={input.code} onChange={set('code')} />
      <UnitFormField label={t.nameEn} value={input.nameEn} onChange={set('nameEn')} />
      <UnitFormField label={t.nameAr} value={input.nameAr} onChange={set('nameAr')} dir="rtl" />
      {!props.isNational && (
        <>
          <UnitFormField label={t.area} value={area} onChange={set('area')} />
          <UnitStatusSelect value={status} onChange={set('status')} />
        </>
      )}
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={props.busy}
      >
        {props.submitLabel}
      </button>
      {props.onCancel && (
        <button type="button" className="rounded border px-3 py-2" onClick={props.onCancel}>
          {t.cancel}
        </button>
      )}
    </form>
  );
}

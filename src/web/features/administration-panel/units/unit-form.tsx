import { useState } from 'react';
import type { UnitInput } from '../../../../shared/committee-register/unit-record';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import { UnitDetailsFields } from './unit-details-fields';
import { UnitStatusSelect } from './unit-status-select';

/** The General Council's fields: it has no area and is always active. */
export type NationalUnitInput = Omit<UnitInput, 'area' | 'status'>;

/**
 * What the form holds: every value as typed, empty for "not entered". A new
 * branch's status starts unchosen: the officer picks it.
 */
export interface UnitFormState {
  code: string;
  nameEn: string;
  nameAr: string;
  area: string;
  status: UnitInput['status'] | '';
  letterheadAddressEn: string;
  letterheadAddressAr: string;
  calendarColourId: string;
}

const orNull = (value: string) => (value.trim() === '' ? null : value);

/** What is sent: empty details as null; the General Council without area or status. */
function toSubmitted(
  input: UnitFormState,
  isNational: boolean,
): UnitInput | NationalUnitInput | null {
  const { area, status, letterheadAddressEn, letterheadAddressAr, calendarColourId, ...names } =
    input;
  const always: NationalUnitInput = {
    ...names,
    letterheadAddressEn: orNull(letterheadAddressEn),
    letterheadAddressAr: orNull(letterheadAddressAr),
    calendarColourId: orNull(calendarColourId),
  };
  if (isNational) return always;
  return status === '' ? null : { ...always, area, status };
}

interface UnitFormProps {
  /** The unit being edited, or null for a new branch. */
  unitId: string | null;
  initial: UnitFormState;
  /** The General Council has no area and is always active. */
  isNational: boolean;
  busy: boolean;
  submitLabel: string;
  onSubmit: (input: UnitInput | NationalUnitInput) => void;
  onCancel?: () => void;
}

/** Brief 14 A1 and 25 B1: a unit's code, names, area, status, letterhead address and calendar colour. */
export function UnitForm(props: UnitFormProps) {
  const t = useText().services['administration-panel'].units;
  const [input, setInput] = useState(props.initial);
  const set = (field: keyof UnitFormState) => (value: string) => {
    setInput((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const submitted = toSubmitted(input, props.isNational);
        if (submitted) props.onSubmit(submitted);
      }}
    >
      <TextField label={t.code} value={input.code} onChange={set('code')} />
      <TextField label={t.nameEn} value={input.nameEn} onChange={set('nameEn')} />
      <TextField label={t.nameAr} value={input.nameAr} onChange={set('nameAr')} dir="rtl" />
      {!props.isNational && (
        <>
          <TextField label={t.area} value={input.area} onChange={set('area')} />
          <UnitStatusSelect value={input.status} onChange={set('status')} />
        </>
      )}
      <UnitDetailsFields
        unitId={props.unitId}
        letterheadAddressEn={input.letterheadAddressEn}
        letterheadAddressAr={input.letterheadAddressAr}
        calendarColourId={input.calendarColourId}
        onChange={(field, value) => {
          set(field)(value);
        }}
      />
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

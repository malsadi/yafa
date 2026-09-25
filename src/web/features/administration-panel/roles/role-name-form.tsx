import { useState } from 'react';
import type { RoleNames } from '../../../../shared/committee-register/role-record';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';

interface RoleNameFormProps {
  initial: RoleNames;
  busy: boolean;
  submitLabel: string;
  onSubmit: (names: RoleNames) => void;
  onCancel?: () => void;
}

/** A role's name in English and Arabic (D-052), for adding or renaming. */
export function RoleNameForm(props: RoleNameFormProps) {
  const t = useText().services['administration-panel'].roles;
  const [names, setNames] = useState(props.initial);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(names);
      }}
    >
      <TextField
        label={t.nameEn}
        value={names.nameEn}
        onChange={(nameEn) => {
          setNames((current) => ({ ...current, nameEn }));
        }}
      />
      <TextField
        label={t.nameAr}
        value={names.nameAr}
        dir="rtl"
        onChange={(nameAr) => {
          setNames((current) => ({ ...current, nameAr }));
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

import { useState } from 'react';
import { useText } from '../app/language/use-text';
import { TextField } from './text-field';

export interface BilingualNames {
  nameEn: string;
  nameAr: string;
}

interface BilingualNameFormProps {
  initial: BilingualNames;
  busy: boolean;
  submitLabel: string;
  onSubmit: (names: BilingualNames) => void;
  onCancel?: () => void;
}

/** A name in English and Arabic (D-052), for adding or renaming a role or list item. */
export function BilingualNameForm(props: BilingualNameFormProps) {
  const t = useText().portalShell.bilingualName;
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

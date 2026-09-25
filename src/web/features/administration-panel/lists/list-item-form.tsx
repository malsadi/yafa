import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import { ColourField } from './colour-field';
import type { ListItemInput } from './lists.api';

interface ListItemFormProps {
  initial: ListItemInput;
  /** D-076: a calendar colour also has its colour. */
  withColour: boolean;
  busy: boolean;
  submitLabel: string;
  onSubmit: (input: ListItemInput) => void;
  onCancel?: () => void;
}

/** A list item's names in English and Arabic, and its colour for a calendar colour. */
export function ListItemForm(props: ListItemFormProps) {
  const text = useText();
  const t = text.portalShell.bilingualName;
  const [input, setInput] = useState(props.initial);
  const set = (field: keyof ListItemInput) => (value: string) => {
    setInput((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(props.withColour ? input : { nameEn: input.nameEn, nameAr: input.nameAr });
      }}
    >
      <TextField label={t.nameEn} value={input.nameEn} onChange={set('nameEn')} />
      <TextField label={t.nameAr} value={input.nameAr} dir="rtl" onChange={set('nameAr')} />
      {props.withColour && <ColourField value={input.colour ?? ''} onChange={set('colour')} />}
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
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

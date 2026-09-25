import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';

interface EditPersonFormProps {
  initial: { name: string; phone: string };
  busy: boolean;
  onSave: (changes: { name: string; phone: string }) => void;
  onCancel: () => void;
}

/** Brief 14 B1: correct a person's name and phone. Their email is how they sign in. */
export function EditPersonForm(props: EditPersonFormProps) {
  const t = useText().services['committee-register'].register;
  const [person, setPerson] = useState(props.initial);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(person);
      }}
    >
      <TextField
        label={t.name}
        value={person.name}
        onChange={(name) => {
          setPerson((p) => ({ ...p, name }));
        }}
      />
      <TextField
        label={t.phone}
        type="tel"
        value={person.phone}
        onChange={(phone) => {
          setPerson((p) => ({ ...p, phone }));
        }}
      />
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white"
        disabled={props.busy}
      >
        {t.save}
      </button>
      <button type="button" className="rounded border px-3 py-2" onClick={props.onCancel}>
        {t.cancel}
      </button>
    </form>
  );
}

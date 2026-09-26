import { useState } from 'react';
import { useText } from '../../app/language/use-text';

/** D-101: name a new field — once, and without braces, which mark fields in the text. */
export function AddFieldForm(props: { fields: string[]; onAdd: (name: string) => void }) {
  const t = useText().services['resources-library'].letterTemplates;
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const canAdd = trimmed !== '' && !/[{}]/.test(trimmed) && !props.fields.includes(trimmed);
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span>{t.fieldName}</span>
        <input
          className="rounded border border-slate-400 p-2"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </label>
      <button
        type="button"
        disabled={!canAdd}
        className="rounded border border-slate-400 px-3 py-2 disabled:opacity-50"
        onClick={() => {
          props.onAdd(trimmed);
          setName('');
        }}
      >
        {t.addField}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { useText } from '../../app/language/use-text';

/** D-101: name a new field — once, and without braces, which mark fields in the text. */
export function AddFieldForm(props: { fields: string[]; onAdd: (name: string) => void }) {
  const t = useText().services['resources-library'].letterTemplates;
  const [name, setName] = useState('');
  const trimmed = name.trim();
  // D-227: say why a typed name cannot be added, rather than leaving the button silently off.
  const problem = /[{}]/.test(trimmed)
    ? t.fieldNameBraces
    : props.fields.includes(trimmed)
      ? t.fieldNameTaken
      : null;
  const canAdd = trimmed !== '' && problem === null;
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
      {problem && <p className="w-full text-sm text-red-800">{problem}</p>}
    </div>
  );
}

import { fieldMark } from '../../../shared/resources-library/letter-template-fields';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { AddFieldForm } from './add-field-form';

interface FieldsEditorProps {
  fields: string[];
  onChange: (fields: string[]) => void;
  /** Puts a field's mark into the letter text. */
  onInsert: (mark: string) => void;
}

/** D-101: the author names the template's fields, and places them in the text. */
export function LetterTemplateFieldsEditor(props: FieldsEditorProps) {
  const t = useText().services['resources-library'].letterTemplates;
  return (
    <fieldset className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <legend className="px-1 font-medium">{t.fields}</legend>
      <p className="text-sm text-slate-600">{t.fieldsExplanation}</p>
      <ul className="flex flex-wrap gap-2">
        {props.fields.map((field) => (
          <li key={field} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
            <button
              type="button"
              className="underline"
              onClick={() => {
                props.onInsert(fieldMark(field));
              }}
            >
              {fillText(t.insertField, { name: field })}
            </button>
            <button
              type="button"
              aria-label={fillText(t.removeField, { name: field })}
              onClick={() => {
                props.onChange(props.fields.filter((f) => f !== field));
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <AddFieldForm
        fields={props.fields}
        onAdd={(name) => {
          props.onChange([...props.fields, name]);
        }}
      />
    </fieldset>
  );
}

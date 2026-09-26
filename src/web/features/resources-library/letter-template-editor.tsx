import { useState } from 'react';
import type { LetterheadUnit } from '../../../shared/resources-library/letter-template';
import { useText } from '../../app/language/use-text';
import { LetterTemplateFieldsEditor } from './letter-template-fields-editor';
import { LetterTemplatePreview } from './letter-template-preview';
import { LetterTemplateTextFields } from './letter-template-text-fields';
import type { LetterTemplateDraft } from './library.api';
import { useFieldInsertion } from './use-field-insertion';

interface EditorProps {
  initial: LetterTemplateDraft;
  unit: LetterheadUnit;
  busy: boolean;
  onSave: (draft: LetterTemplateDraft) => void;
  onCancel: () => void;
}

/** Brief 16 D1, P19, D-101 and D-102: write a letter template beside its live preview. */
export function LetterTemplateEditor(props: EditorProps) {
  const t = useText().services['resources-library'].letterTemplates;
  const [draft, setDraft] = useState(props.initial);
  const set = <K extends keyof LetterTemplateDraft>(key: K, value: LetterTemplateDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const { bind, insert } = useFieldInsertion((target, value) => {
    set(target, value);
  });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          props.onSave(draft);
        }}
      >
        <LetterTemplateTextFields draft={draft} set={set} bind={bind} />
        <LetterTemplateFieldsEditor
          fields={draft.fields}
          onChange={(f) => {
            set('fields', f);
          }}
          onInsert={insert}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={props.busy}
            className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {t.save}
          </button>
          <button
            type="button"
            className="rounded border border-slate-400 px-4 py-2"
            onClick={props.onCancel}
          >
            {t.cancel}
          </button>
        </div>
      </form>
      <LetterTemplatePreview draft={draft} unit={props.unit} />
    </div>
  );
}

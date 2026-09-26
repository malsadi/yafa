import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import type { LetterTemplateDraft } from './library.api';
import type { useFieldInsertion } from './use-field-insertion';

interface TextFieldsProps {
  draft: LetterTemplateDraft;
  set: <K extends keyof LetterTemplateDraft>(key: K, value: LetterTemplateDraft[K]) => void;
  bind: ReturnType<typeof useFieldInsertion>['bind'];
}

/** P19: a template's title, language, subject and letter text. */
export function LetterTemplateTextFields({ draft, set, bind }: TextFieldsProps) {
  const t = useText().services['resources-library'].letterTemplates;
  const dir = draft.language === 'ar' ? 'rtl' : undefined;
  return (
    <>
      <TextField
        label={t.title}
        value={draft.title}
        onChange={(v) => {
          set('title', v);
        }}
      />
      <SelectField
        label={t.language}
        value={draft.language}
        options={(['en', 'ar'] as const).map((l) => ({ value: l, label: t.languages[l] }))}
        onChange={(v) => {
          set('language', v === 'ar' ? 'ar' : 'en');
        }}
      />
      <label className="flex flex-col gap-1">
        <span>{t.subject}</span>
        <input
          className="rounded border border-slate-400 p-2"
          required
          dir={dir}
          value={draft.subject}
          {...bind('subject')}
          onChange={(e) => {
            set('subject', e.target.value);
          }}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{t.body}</span>
        <textarea
          className="rounded border border-slate-400 p-2"
          rows={10}
          required
          dir={dir}
          value={draft.body}
          {...bind('body')}
          onChange={(e) => {
            set('body', e.target.value);
          }}
        />
      </label>
    </>
  );
}

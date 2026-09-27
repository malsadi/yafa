import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import type { TemplateDraft } from './template-draft';
import { TemplateLineRows } from './template-line-rows';
import { TemplateTaskRows } from './template-task-rows';

/** D-178: a template's name, default tasks and default budget lines. */
export function TemplateFields(props: {
  draft: TemplateDraft;
  onChange: (draft: TemplateDraft) => void;
}) {
  const t = useText().services['event-organiser'].templates;
  const { draft, onChange } = props;
  return (
    <>
      <TextField
        label={t.name}
        value={draft.name}
        onChange={(name) => {
          onChange({ ...draft, name });
        }}
      />
      <TemplateTaskRows
        rows={draft.tasks}
        onChange={(tasks) => {
          onChange({ ...draft, tasks });
        }}
      />
      <TemplateLineRows
        rows={draft.budgetLines}
        onChange={(budgetLines) => {
          onChange({ ...draft, budgetLines });
        }}
      />
    </>
  );
}

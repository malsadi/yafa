import type {
  LetterheadUnit,
  LetterTemplateRecord,
} from '../../../shared/resources-library/letter-template';
import { ApiError } from '../../app/api/api-error';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import { LetterTemplateEditor } from './letter-template-editor';
import type { LetterTemplateDraft } from './library.api';
import { useLetterTemplateActions } from './use-letter-template-actions';

const BLANK: LetterTemplateDraft = { title: '', subject: '', body: '', fields: [], language: 'en' };

interface EditingProps {
  unitId: string;
  /** The template being changed, or none for a new one. */
  template: LetterTemplateRecord | undefined;
  unit: LetterheadUnit;
  onDone: () => void;
}

/** P19 and 9.1: write a new template, or change one from the version read. */
export function LetterTemplateEditing({ unitId, template, unit, onDone }: EditingProps) {
  const t = useText().services['resources-library'].letterTemplates;
  const { create, save } = useLetterTemplateActions(unitId);
  const error = create.error ?? save.error;
  return (
    <div className="flex flex-col gap-3">
      <RefusalAlert code={error instanceof ApiError ? error.code : null} refusals={t.refusals} />
      <LetterTemplateEditor
        initial={template ?? BLANK}
        unit={unit}
        busy={create.isPending || save.isPending}
        onCancel={onDone}
        onSave={(draft) => {
          if (template) {
            save.mutate(
              { templateId: template.id, version: template.version, template: draft },
              { onSuccess: onDone },
            );
          } else {
            create.mutate(draft, { onSuccess: onDone });
          }
        }}
      />
    </div>
  );
}

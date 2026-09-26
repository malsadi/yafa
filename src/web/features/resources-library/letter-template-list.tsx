import type { LetterTemplateRecord } from '../../../shared/resources-library/letter-template';
import { ApiError } from '../../app/api/api-error';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import { LetterTemplateItem } from './letter-template-item';
import { useLetterTemplateActions } from './use-letter-template-actions';

interface ListProps {
  unitId: string;
  templates: LetterTemplateRecord[];
  /** A hint only (T-042): the portal decides each change itself. */
  mayManage: boolean;
  onEdit: (templateId: string) => void;
}

/** Brief 16 D1 and D-100: the templates, with writing, changing, retiring and bringing back. */
export function LetterTemplateList({ unitId, templates, mayManage, onEdit }: ListProps) {
  const t = useText().services['resources-library'].letterTemplates;
  const { setRetired } = useLetterTemplateActions(unitId);
  const error = setRetired.error;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      <RefusalAlert code={error instanceof ApiError ? error.code : null} refusals={t.refusals} />
      {mayManage && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            onEdit('');
          }}
        >
          {t.newTemplate}
        </button>
      )}
      {templates.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {templates.map((template) => (
          <LetterTemplateItem
            key={template.id}
            template={template}
            manages={mayManage && template.unitId === unitId}
            busy={setRetired.isPending}
            onEdit={() => {
              onEdit(template.id);
            }}
            onSetRetired={(retire) => {
              setRetired.mutate({ templateId: template.id, version: template.version, retire });
            }}
          />
        ))}
      </ul>
    </section>
  );
}

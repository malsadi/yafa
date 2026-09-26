import type { LetterTemplateRecord } from '../../../shared/resources-library/letter-template';
import { useText } from '../../app/language/use-text';

interface ItemProps {
  template: LetterTemplateRecord;
  /** Whether this officer may change it: their own unit's, with the capability. */
  manages: boolean;
  busy: boolean;
  onEdit: () => void;
  onSetRetired: (retire: boolean) => void;
}

/** Brief 16 D1: one letter template, marked national or retired, with its actions. */
export function LetterTemplateItem({ template, manages, busy, onEdit, onSetRetired }: ItemProps) {
  const t = useText().services['resources-library'].letterTemplates;
  const retired = template.retiredAt !== null;
  return (
    <li className="flex flex-wrap items-center gap-3 rounded border border-slate-300 p-3">
      <span className="font-medium">{template.title}</span>
      <span className="text-sm text-slate-600">{t.languages[template.language]}</span>
      {template.national && <span className="rounded bg-slate-100 px-2 text-sm">{t.national}</span>}
      {retired && <span className="rounded bg-amber-100 px-2 text-sm">{t.retired}</span>}
      {manages && (
        <span className="ms-auto flex gap-2">
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            onClick={onEdit}
          >
            {t.edit}
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded border border-slate-400 px-3 py-1"
            onClick={() => {
              onSetRetired(!retired);
            }}
          >
            {retired ? t.restore : t.retire}
          </button>
        </span>
      )}
    </li>
  );
}

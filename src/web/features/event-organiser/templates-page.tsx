import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { TemplateForm } from './template-form';
import { TemplateItem } from './template-item';
import { useTemplates } from './use-event-queries';
import { useEventUnit } from './use-event-unit';

/** Brief 21 A3, P15 and D-178: the unit's event templates — the General Council's are national. */
export function TemplatesPage() {
  const unitId = useEventUnit();
  const text = useText();
  const t = text.services['event-organiser'];
  const templates = useTemplates(unitId);
  const [adding, setAdding] = useState(false);
  if (templates.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (templates.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.templates.heading}</h2>
      {templates.data.length === 0 && <p>{t.templates.none}</p>}
      <ul className="flex flex-col gap-2">
        {templates.data.map((template) => (
          <TemplateItem key={template.id} unitId={unitId} template={template} />
        ))}
      </ul>
      {!adding && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setAdding(true);
          }}
        >
          {t.templates.add}
        </button>
      )}
      {adding && (
        <TemplateForm
          unitId={unitId}
          onDone={() => {
            setAdding(false);
          }}
        />
      )}
    </section>
  );
}

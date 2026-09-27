import { useState } from 'react';
import type { EventTemplateRecord } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { ActionButton } from '../../components/action-button';
import { unitPath } from './event-organiser.api';
import { TemplateForm } from './template-form';
import { useEventAction } from './use-event-action';

/** D-178 and D-192: one template — changed, retired from new events, or brought back; never deleted. */
export function TemplateItem(props: { unitId: string; template: EventTemplateRecord }) {
  const t = useText().services['event-organiser'];
  const retire = useEventAction();
  const [editing, setEditing] = useState(false);
  const { template } = props;
  if (editing)
    return (
      <li>
        <TemplateForm
          unitId={props.unitId}
          template={template}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  const action = template.retiredAt === null ? 'retire' : 'restore';
  const toggle = () => {
    const path = `${unitPath(props.unitId)}/templates/${template.id}/${action}`;
    retire.mutate({ path, method: 'POST', body: { version: template.version } });
  };
  const summary = {
    tasks: String(template.tasks.length),
    lines: String(template.budgetLines.length),
  };
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{template.name}</span>
        {template.retiredAt !== null && (
          <span className="rounded bg-slate-100 px-2 text-sm">{t.templates.retired}</span>
        )}
      </div>
      <p className="text-sm">{fillText(t.templates.summary, summary)}</p>
      <ErrorAlert error={retire.error} refusals={t.refusals} />
      <div className="flex flex-wrap gap-2">
        <ActionButton
          label={t.templates.change}
          onClick={() => {
            setEditing(true);
          }}
        />
        <ActionButton label={t.templates[action]} disabled={retire.isPending} onClick={toggle} />
      </div>
    </li>
  );
}

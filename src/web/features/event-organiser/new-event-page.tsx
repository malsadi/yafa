import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { SelectField } from '../../components/select-field';
import { StatusMessage } from '../../components/status-message';
import { EventClashNotice } from './event-clash-notice';
import { createRequest, eventDraftOf } from './event-draft';
import { EventFields } from './event-fields';
import { useEventAction } from './use-event-action';
import { useEventChoices, useTemplateChoices } from './use-event-queries';
import { useEventUnit } from './use-event-unit';

/** Brief 21 A1, A3 and D-172, D-178: a new event, perhaps from a template, with clash notices. */
export function NewEventPage() {
  const unitId = useEventUnit();
  const text = useText();
  const t = text.services['event-organiser'];
  const navigate = useNavigate();
  const choices = useEventChoices(unitId);
  const templates = useTemplateChoices(unitId, true);
  const create = useEventAction<{ id: string }>();
  const [draft, setDraft] = useState(eventDraftOf());
  const [templateId, setTemplateId] = useState('');
  if (choices.isPending || templates.isPending)
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (choices.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate(createRequest(unitId, draft, templateId), {
          onSuccess: (created) => {
            void navigate(`/event-organiser/events/${created.id}`);
          },
        });
      }}
    >
      <h2 className="text-lg font-semibold">{t.list.add}</h2>
      <ErrorAlert error={create.error ?? templates.error} refusals={t.refusals} />
      <SelectField
        label={t.form.template}
        value={templateId}
        optional
        emptyLabel={t.form.noTemplate}
        options={(templates.data ?? []).map((tpl) => ({ value: tpl.id, label: tpl.name }))}
        onChange={setTemplateId}
      />
      <EventFields draft={draft} choices={choices.data} onChange={setDraft} />
      <EventClashNotice unitId={unitId} firstDay={draft.firstDay} lastDay={draft.lastDay} />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={create.isPending}
        onCancel={() => {
          void navigate('/event-organiser/events');
        }}
      />
    </form>
  );
}

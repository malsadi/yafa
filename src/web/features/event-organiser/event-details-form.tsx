import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { StatusMessage } from '../../components/status-message';
import { EventClashNotice } from './event-clash-notice';
import { changeRequest, eventDraftOf } from './event-draft';
import { EventFields } from './event-fields';
import { useEventAction } from './use-event-action';
import { useEventChoices } from './use-event-queries';

/** D-176: the name, type, dates and lead officer changed, from the version read (9.1). */
export function EventDetailsForm(props: { event: EventSummary; onDone: () => void }) {
  const text = useText();
  const t = text.services['event-organiser'];
  const choices = useEventChoices(props.event.unitId);
  const save = useEventAction();
  const [draft, setDraft] = useState(eventDraftOf(props.event));
  if (choices.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  const current = props.event;
  const offered = {
    types: choices.data?.types ?? [],
    leads: (choices.data?.leads ?? []).some((l) => l.personId === current.leadPersonId)
      ? (choices.data?.leads ?? [])
      : [
          ...(choices.data?.leads ?? []),
          { personId: current.leadPersonId, name: current.leadName ?? '' },
        ],
  };
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(changeRequest(current, draft), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error ?? choices.error} refusals={t.refusals} />
      <EventFields draft={draft} choices={offered} onChange={setDraft} />
      <EventClashNotice
        unitId={current.unitId}
        firstDay={draft.firstDay}
        lastDay={draft.lastDay}
        eventId={current.id}
      />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}

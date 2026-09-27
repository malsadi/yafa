import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { EventDetailsForm } from './event-details-form';
import { useEventHints } from './event-hints';

/** Brief 21 A1 and D-172: the event's details, status and cancel reason, changed until it is closed (D-176). */
export function EventDetailsPanel({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'];
  const date = useFormatDate();
  const { language } = useLanguage();
  const hints = useEventHints(event);
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <EventDetailsForm
        event={event}
        onDone={() => {
          setEditing(false);
        }}
      />
    );
  const days = event.lastDay
    ? `${date(event.firstDay)} – ${date(event.lastDay)}`
    : date(event.firstDay);
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{event.name}</h2>
        <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[event.status]}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>{t.form.type}</dt>
        <dd>{language === 'ar' ? event.typeNameAr : event.typeNameEn}</dd>
        <dt>{t.form.lead}</dt>
        <dd>{event.leadName}</dd>
        <dt>{t.details.when}</dt>
        <dd>{event.startTime ? `${days}, ${event.startTime}` : days}</dd>
      </dl>
      {event.cancelReason && (
        <p className="text-sm">{fillText(t.details.cancelled, { reason: event.cancelReason })}</p>
      )}
      {hints.manages && (
        <button
          type="button"
          className="self-start rounded border border-slate-400 px-3 py-1"
          onClick={() => {
            setEditing(true);
          }}
        >
          {t.details.edit}
        </button>
      )}
    </section>
  );
}

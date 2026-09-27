import { useState } from 'react';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { fillText } from '../../text/fill-text';
import { MeetingDetailsForm } from './meeting-details-form';
import { MeetingFacts } from './meeting-facts';
import { useMeetingHints } from './meeting-hints';

/** Brief 22 A1 and D-198: the meeting's details and status; changed while scheduled (D-202). */
export function MeetingDetailsPanel({ meeting }: { meeting: MeetingSummary }) {
  const t = useText().services['meeting-recorder'];
  const { language } = useLanguage();
  const hints = useMeetingHints(meeting);
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <MeetingDetailsForm
        meeting={meeting}
        onDone={() => {
          setEditing(false);
        }}
      />
    );
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">
          {language === 'ar' ? meeting.typeNameAr : meeting.typeNameEn}
        </h2>
        <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[meeting.status]}</span>
      </div>
      <MeetingFacts meeting={meeting} />
      {meeting.cancelReason && (
        <p className="text-sm">{fillText(t.details.cancelled, { reason: meeting.cancelReason })}</p>
      )}
      {hints.sets && (
        <ActionButton
          label={t.details.edit}
          onClick={() => {
            setEditing(true);
          }}
        />
      )}
    </section>
  );
}

import type { ServiceSlug } from '../../../shared/core/services';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { useMeetingHints } from './meeting-hints';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';

type Target = 'calendar' | 'meeting-scheduled' | 'meeting-held';

/** D-209: a Calendar entry or hub message skipped while its service was off — said so, and offered once it is back on. */
export function MeetingTargetsPanel({ meeting }: { meeting: MeetingSummary }) {
  const t = useText().services['meeting-recorder'].targets;
  const refusals = useText().services['meeting-recorder'].refusals;
  const { unit } = useSelectedUnit();
  const hints = useMeetingHints(meeting);
  const send = useMeetingAction();
  if (meeting.status === 'Cancelled') return null;
  const on = (service: ServiceSlug) => unit?.enabledServices.includes(service) ?? false;
  const skipped: { target: Target; service: ServiceSlug }[] = [
    ...(meeting.calendarWrittenAt === null
      ? [{ target: 'calendar' as const, service: 'calendar' as const }]
      : []),
    ...(meeting.scheduledPostedAt === null
      ? [{ target: 'meeting-scheduled' as const, service: 'communication-hub' as const }]
      : []),
    ...(meeting.status === 'Report logged' && meeting.heldPostedAt === null
      ? [{ target: 'meeting-held' as const, service: 'communication-hub' as const }]
      : []),
  ];
  if (skipped.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 text-sm">
      <ErrorAlert error={send.error} refusals={refusals} />
      {skipped.map(({ target, service }) => (
        <div key={target} className="flex flex-wrap items-center gap-2">
          <span>{on(service) ? t.notSent[target] : t.skipped[target]}</span>
          {hints.manages && on(service) && (
            <ActionButton
              label={t.send[target]}
              disabled={send.isPending}
              onClick={() => {
                send.mutate({
                  path: `${meetingPath(meeting.unitId, meeting.id)}/send-later`,
                  method: 'POST',
                  body: { target },
                });
              }}
            />
          )}
        </div>
      ))}
    </section>
  );
}

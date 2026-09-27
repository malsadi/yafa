import type { MeetingDetail } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { AgendaItemAdder } from './agenda-item-adder';
import { AgendaItemRow } from './agenda-item-row';
import { useMeetingHints } from './meeting-hints';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';

/**
 * Brief 22 A3 and D-204: the agenda — set, changed, removed and ordered
 * before the meeting; while it is held, points raised in it are added and
 * marked so, and the original items stay as they were.
 */
export function AgendaPanel({ detail }: { detail: MeetingDetail }) {
  const t = useText().services['meeting-recorder'];
  const { meeting, agenda } = detail;
  const hints = useMeetingHints(meeting);
  const order = useMeetingAction();
  const base = meetingPath(meeting.unitId, meeting.id);
  const move = (index: number, by: number) => {
    const ids = agenda.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    if (moved) ids.splice(index + by, 0, moved);
    order.mutate({ path: `${base}/agenda-order`, method: 'PUT', body: { itemIds: ids } });
  };
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.agenda.heading}</h3>
      <ErrorAlert error={order.error} refusals={t.refusals} />
      <ol className="flex flex-col gap-1">
        {agenda.map((item, index) => (
          <AgendaItemRow
            key={item.id}
            item={item}
            base={base}
            editable={hints.sets || (hints.records && item.raisedInMeeting)}
            removable={hints.sets}
            onUp={
              hints.sets && index > 0
                ? () => {
                    move(index, -1);
                  }
                : null
            }
            onDown={
              hints.sets && index < agenda.length - 1
                ? () => {
                    move(index, 1);
                  }
                : null
            }
          />
        ))}
      </ol>
      {(hints.sets || hints.records) && <AgendaItemAdder base={base} raised={hints.records} />}
    </section>
  );
}

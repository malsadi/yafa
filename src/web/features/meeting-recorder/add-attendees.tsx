import { useState } from 'react';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { OfficerCheckboxes } from './officer-checkboxes';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';
import { useMeetingChoices } from './use-meeting-queries';

/** Brief 22 A2: more attendees, from the unit's officers not yet attending. */
export function AddAttendees(props: { meeting: MeetingSummary; attending: string[] }) {
  const t = useText().services['meeting-recorder'].attendees;
  const choices = useMeetingChoices(props.meeting.unitId);
  const add = useMeetingAction();
  const [chosen, setChosen] = useState<string[]>([]);
  const others = (choices.data?.officers ?? []).filter(
    (o) => !props.attending.includes(o.personId),
  );
  if (others.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <OfficerCheckboxes legend={t.add} officers={others} chosen={chosen} onChange={setChosen} />
      <ActionButton
        label={t.addChosen}
        disabled={add.isPending || chosen.length === 0}
        onClick={() => {
          const path = `${meetingPath(props.meeting.unitId, props.meeting.id)}/attendees`;
          add.mutate(
            { path, method: 'POST', body: { personIds: chosen } },
            {
              onSuccess: () => {
                setChosen([]);
              },
            },
          );
        }}
      />
    </div>
  );
}

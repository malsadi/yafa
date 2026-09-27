import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import type { EventDraft } from './event-draft';

/** D-172: a first day with an optional start time, and an optional last day for an event over several days. */
export function EventDateFields(props: {
  draft: EventDraft;
  onChange: (draft: EventDraft) => void;
}) {
  const t = useText().services['event-organiser'].form;
  const set = (field: 'firstDay' | 'startTime' | 'lastDay') => (value: string) => {
    props.onChange({ ...props.draft, [field]: value });
  };
  return (
    <div className="flex flex-wrap gap-3">
      <TextField
        label={t.firstDay}
        type="date"
        value={props.draft.firstDay}
        onChange={set('firstDay')}
      />
      <TextField
        label={t.startTime}
        type="time"
        optional
        value={props.draft.startTime}
        onChange={set('startTime')}
      />
      <TextField
        label={t.lastDay}
        type="date"
        optional
        value={props.draft.lastDay}
        onChange={set('lastDay')}
      />
    </div>
  );
}

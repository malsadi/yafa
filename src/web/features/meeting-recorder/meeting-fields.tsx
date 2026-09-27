import { useNamedOptions } from '../../app/language/use-named-options';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import type { MeetingDraft } from './meeting-draft';
import type { MeetingChoices } from './meeting-recorder.api';
import { MeetingPeopleFields } from './meeting-people-fields';

/** Brief 22 A1 and D-198: type, date and time, place and/or online link, chair and secretary. */
export function MeetingFields(props: {
  draft: MeetingDraft;
  choices: MeetingChoices;
  onChange: (draft: MeetingDraft) => void;
}) {
  const t = useText().services['meeting-recorder'].form;
  const named = useNamedOptions();
  const set = (field: keyof MeetingDraft) => (value: string) => {
    props.onChange({ ...props.draft, [field]: value });
  };
  const { draft } = props;
  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label={t.type}
        value={draft.typeItemId}
        emptyLabel=""
        options={named(props.choices.types)}
        onChange={set('typeItemId')}
      />
      <div className="flex flex-wrap gap-3">
        <TextField label={t.date} type="date" value={draft.date} onChange={set('date')} />
        <TextField
          label={t.startTime}
          type="time"
          value={draft.startTime}
          onChange={set('startTime')}
        />
      </div>
      <TextField label={t.place} optional value={draft.place} onChange={set('place')} />
      <TextField
        label={t.onlineLink}
        optional
        value={draft.onlineLink}
        onChange={set('onlineLink')}
      />
      <MeetingPeopleFields
        draft={draft}
        officers={props.choices.officers}
        onChange={props.onChange}
      />
    </div>
  );
}

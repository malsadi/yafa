import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import type { MeetingDraft } from './meeting-draft';

/** D-198: the chair and the secretary, from the unit's current officers. */
export function MeetingPeopleFields(props: {
  draft: MeetingDraft;
  officers: { personId: string; name: string }[];
  onChange: (draft: MeetingDraft) => void;
}) {
  const t = useText().services['meeting-recorder'].form;
  const { draft } = props;
  const set = (field: 'chairPersonId' | 'secretaryPersonId') => (value: string) => {
    props.onChange({ ...draft, [field]: value });
  };
  const officers = props.officers.map((o) => ({ value: o.personId, label: o.name }));
  return (
    <>
      <SelectField
        label={t.chair}
        value={draft.chairPersonId}
        emptyLabel=""
        options={officers}
        onChange={set('chairPersonId')}
      />
      <SelectField
        label={t.secretary}
        value={draft.secretaryPersonId}
        emptyLabel=""
        options={officers}
        onChange={set('secretaryPersonId')}
      />
    </>
  );
}

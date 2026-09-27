import { useNamedOptions } from '../../app/language/use-named-options';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import { EventDateFields } from './event-date-fields';
import type { EventDraft } from './event-draft';
import type { EventChoices } from './event-organiser.api';

/** Brief 21 A1 and D-172: name, type, lead officer, and the dates. */
export function EventFields(props: {
  draft: EventDraft;
  choices: EventChoices;
  onChange: (draft: EventDraft) => void;
}) {
  const t = useText().services['event-organiser'].form;
  const named = useNamedOptions();
  const { draft } = props;
  const set = (field: 'name' | 'typeItemId' | 'leadPersonId') => (value: string) => {
    props.onChange({ ...draft, [field]: value });
  };
  const leads = props.choices.leads.map((l) => ({ value: l.personId, label: l.name }));
  return (
    <div className="flex flex-col gap-3">
      <TextField label={t.name} value={draft.name} onChange={set('name')} />
      <SelectField
        label={t.type}
        value={draft.typeItemId}
        emptyLabel=""
        options={named(props.choices.types)}
        onChange={set('typeItemId')}
      />
      <SelectField
        label={t.lead}
        value={draft.leadPersonId}
        emptyLabel=""
        options={leads}
        onChange={set('leadPersonId')}
      />
      <EventDateFields draft={draft} onChange={props.onChange} />
    </div>
  );
}

import { useText } from '../../app/language/use-text';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { AllBranchesCheckbox } from './all-branches-checkbox';
import type { CommunityDateDraft } from './community-date-draft';

/** D-145 and D-146: title, first day, optional last day, time and description; for all branches (General Council only). */
export function CommunityDateFields(props: {
  draft: CommunityDateDraft;
  onChange: (draft: CommunityDateDraft) => void;
  offerAllBranches: boolean;
}) {
  const f = useText().services.calendar.form;
  const set = (key: keyof CommunityDateDraft) => (value: string | boolean) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  return (
    <>
      <TextField label={f.title} value={props.draft.title} onChange={set('title')} />
      <TextField
        label={f.startDate}
        type="date"
        value={props.draft.startDate}
        onChange={set('startDate')}
      />
      <TextField
        label={f.endDate}
        type="date"
        optional
        value={props.draft.endDate}
        onChange={set('endDate')}
      />
      <TextField
        label={f.startTime}
        type="time"
        optional
        value={props.draft.startTime}
        onChange={set('startTime')}
      />
      <TextAreaField
        label={f.description}
        value={props.draft.description}
        onChange={set('description')}
      />
      {props.offerAllBranches && (
        <AllBranchesCheckbox
          checked={props.draft.forAllBranches}
          onChange={set('forAllBranches')}
        />
      )}
    </>
  );
}

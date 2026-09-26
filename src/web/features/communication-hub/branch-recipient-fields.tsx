import type { CircularBranch } from '../../../shared/communication-hub/circular-records';
import { useLanguage } from '../../app/language/use-language';
import { SelectField } from '../../components/select-field';
import { ChoiceCheckboxes } from './choice-checkboxes';

export interface RecipientChoice {
  to: 'all' | 'chosen';
  unitIds: string[];
}

/** All branches, or those chosen from the list — for a circular (20 A3) or a request (P13). */
export function BranchRecipientFields(props: {
  labels: { recipients: string; allBranches: string; chosenBranches: string; branches: string };
  branches: CircularBranch[] | undefined;
  choice: RecipientChoice;
  onChange: (choice: RecipientChoice) => void;
}) {
  const { language } = useLanguage();
  const { labels, choice } = props;
  return (
    <>
      <SelectField
        label={labels.recipients}
        value={choice.to}
        onChange={(to) => {
          props.onChange({ ...choice, to: to as RecipientChoice['to'] });
        }}
        options={[
          { value: 'all', label: labels.allBranches },
          { value: 'chosen', label: labels.chosenBranches },
        ]}
      />
      {choice.to === 'chosen' && props.branches && (
        <ChoiceCheckboxes
          legend={labels.branches}
          choices={props.branches.map((b) => ({
            value: b.id,
            label: language === 'ar' ? b.nameAr : b.nameEn,
          }))}
          chosen={choice.unitIds}
          onChange={(unitIds) => {
            props.onChange({ ...choice, unitIds });
          }}
        />
      )}
    </>
  );
}

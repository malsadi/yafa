import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { ChoiceCheckboxes } from './choice-checkboxes';
import type { CircularDraft } from './circular-draft';
import { useCircularBranches } from './use-circulars';

/** Brief 20 A3: all branches, or the branches chosen from the list. */
export function CircularRecipientFields(props: {
  unitId: string;
  draft: CircularDraft;
  onChange: (draft: CircularDraft) => void;
}) {
  const f = useText().services['communication-hub'].circulars.form;
  const { language } = useLanguage();
  const branches = useCircularBranches(props.unitId);
  const { draft } = props;
  return (
    <>
      <SelectField
        label={f.recipients}
        value={draft.to}
        onChange={(to) => {
          props.onChange({ ...draft, to: to as CircularDraft['to'] });
        }}
        options={[
          { value: 'all', label: f.allBranches },
          { value: 'chosen', label: f.chosenBranches },
        ]}
      />
      {draft.to === 'chosen' && branches.data && (
        <ChoiceCheckboxes
          legend={f.branches}
          choices={branches.data.map((b) => ({
            value: b.id,
            label: language === 'ar' ? b.nameAr : b.nameEn,
          }))}
          chosen={draft.unitIds}
          onChange={(unitIds) => {
            props.onChange({ ...draft, unitIds });
          }}
        />
      )}
    </>
  );
}

import { useText } from '../../app/language/use-text';
import { BranchRecipientFields } from './branch-recipient-fields';
import type { CircularDraft } from './circular-draft';
import { useCircularBranches } from './use-circulars';

/** Brief 20 A3: all branches, or the branches chosen from the list. */
export function CircularRecipientFields(props: {
  unitId: string;
  draft: CircularDraft;
  onChange: (draft: CircularDraft) => void;
}) {
  const f = useText().services['communication-hub'].circulars.form;
  const branches = useCircularBranches(props.unitId);
  return (
    <BranchRecipientFields
      labels={f}
      branches={branches.data}
      choice={props.draft}
      onChange={(choice) => {
        props.onChange({ ...props.draft, ...choice });
      }}
    />
  );
}

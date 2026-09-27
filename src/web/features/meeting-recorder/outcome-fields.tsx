import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import type { OutcomeDraft } from './outcome-draft';

/** D-206: a vote's numbers and result, or a decision's text. */
export function OutcomeFields(props: {
  draft: OutcomeDraft;
  onChange: (draft: OutcomeDraft) => void;
}) {
  const o = useText().services['meeting-recorder'].outcome;
  const { draft } = props;
  const set = (field: keyof OutcomeDraft) => (value: string) => {
    props.onChange({ ...draft, [field]: value });
  };
  const kinds = [
    { value: 'decision', label: o.decision },
    { value: 'vote', label: o.vote },
  ];
  return (
    <>
      <SelectField label={o.kind} value={draft.kind} options={kinds} onChange={set('kind')} />
      {draft.kind === 'vote' ? (
        <div className="flex flex-wrap gap-2">
          <TextField
            label={o.for}
            type="number"
            value={draft.votesFor}
            onChange={set('votesFor')}
          />
          <TextField
            label={o.against}
            type="number"
            value={draft.votesAgainst}
            onChange={set('votesAgainst')}
          />
          <TextField
            label={o.abstain}
            type="number"
            value={draft.votesAbstain}
            onChange={set('votesAbstain')}
          />
          <TextField label={o.result} value={draft.voteResult} onChange={set('voteResult')} />
        </div>
      ) : (
        <TextAreaField label={o.decisionText} value={draft.decision} onChange={set('decision')} />
      )}
    </>
  );
}

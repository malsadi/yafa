import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import type { VoteDraft } from './notice-draft';
import { VoteEligibilityFields } from './vote-eligibility-fields';
import { VoteOptionsFields } from './vote-options-fields';

/** Brief 20 A2: a vote's question, options, closing date and voters. */
export function VoteFields(props: {
  unitId: string;
  vote: VoteDraft;
  onChange: (vote: VoteDraft) => void;
}) {
  const t = useText().services['communication-hub'].noticeForm;
  const { vote } = props;
  const set = (key: 'question' | 'closesOn') => (value: string) => {
    props.onChange({ ...vote, [key]: value });
  };
  return (
    <div className="flex flex-col gap-3 rounded bg-slate-50 p-3">
      <TextField label={t.question} value={vote.question} onChange={set('question')} />
      <VoteOptionsFields
        options={vote.options}
        onChange={(options) => {
          props.onChange({ ...vote, options });
        }}
      />
      <TextField label={t.closesOn} type="date" value={vote.closesOn} onChange={set('closesOn')} />
      <VoteEligibilityFields unitId={props.unitId} vote={vote} onChange={props.onChange} />
    </div>
  );
}

import { useText } from '../../app/language/use-text';
import type { NoticeDraft } from './notice-draft';
import { VoteFields } from './vote-fields';

/** D-155: putting the notice to a vote — or, once anyone has voted, a note that the vote is locked. */
export function NoticeVoteSection(props: {
  unitId: string;
  draft: NoticeDraft;
  locked: boolean;
  onChange: (draft: NoticeDraft) => void;
}) {
  const f = useText().services['communication-hub'].noticeForm;
  const { draft } = props;
  if (props.locked) return <p className="text-sm">{f.voteLocked}</p>;
  return (
    <>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.withVote}
          onChange={(event) => {
            props.onChange({ ...draft, withVote: event.target.checked });
          }}
        />
        {f.withVote}
      </label>
      {draft.withVote && (
        <VoteFields
          unitId={props.unitId}
          vote={draft.vote}
          onChange={(vote) => {
            props.onChange({ ...draft, vote });
          }}
        />
      )}
    </>
  );
}

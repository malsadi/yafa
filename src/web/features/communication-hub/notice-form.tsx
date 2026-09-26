import { useState } from 'react';
import type { NoticeRecord } from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { draftOf, saveRequest } from './notice-draft';
import { useHubAction } from './use-hub-action';
import { NoticeVoteSection } from './notice-vote-section';

/**
 * Brief 20 A1, A2 and D-155: post a notice, perhaps put to a vote, or change
 * one from the version read (9.1). Once anyone has voted, the vote is shown
 * as locked and left as it is.
 */
export function NoticeForm(props: { unitId: string; notice?: NoticeRecord; onDone: () => void }) {
  const t = useText().services['communication-hub'];
  const f = t.noticeForm;
  const save = useHubAction();
  const [draft, setDraft] = useState(draftOf(props.notice));
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(saveRequest(props.unitId, draft, props.notice), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <TextField
        label={f.title}
        value={draft.title}
        onChange={(title) => {
          setDraft({ ...draft, title });
        }}
      />
      <TextAreaField
        label={f.body}
        value={draft.body}
        onChange={(body) => {
          setDraft({ ...draft, body });
        }}
      />
      <NoticeVoteSection
        unitId={props.unitId}
        draft={draft}
        locked={props.notice?.vote?.hasVotes === true}
        onChange={setDraft}
      />
      <FormButtons
        submit={f.save}
        cancel={f.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}

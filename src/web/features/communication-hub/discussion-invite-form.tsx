import { useState } from 'react';
import type { DiscussionSummary } from '../../../shared/communication-hub/conversation-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { discussionPath } from './conversations.api';
import { InviteeCheckboxes } from './invitee-checkboxes';
import { useHubAction } from './use-hub-action';

/**
 * D-159: the starter invites more officers. The screen says plainly that
 * whoever is added sees everything already said, not only new messages.
 */
export function DiscussionInviteForm(props: {
  unitId: string;
  discussion: DiscussionSummary;
  onDone: () => void;
}) {
  const t = useText().services['communication-hub'];
  const invite = useHubAction();
  const [personIds, setPersonIds] = useState<string[]>([]);
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        invite.mutate(
          {
            path: `${discussionPath(props.discussion.id)}/members`,
            method: 'POST',
            body: { personIds },
          },
          { onSuccess: props.onDone },
        );
      }}
    >
      <p role="note" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm">
        {t.discussions.inviteWarning}
      </p>
      <ErrorAlert error={invite.error} refusals={t.refusals} />
      <InviteeCheckboxes
        unitId={props.unitId}
        legend={t.discussions.invite}
        exclude={props.discussion.members.map((m) => m.personId)}
        chosen={personIds}
        onChange={setPersonIds}
      />
      <FormButtons
        submit={t.discussions.inviteSave}
        cancel={t.discussions.form.cancel}
        busy={invite.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}

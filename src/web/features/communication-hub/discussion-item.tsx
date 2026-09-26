import { useState } from 'react';
import type { DiscussionSummary } from '../../../shared/communication-hub/conversation-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { ConversationThread } from './conversation-thread';
import { discussionPath } from './conversations.api';
import { DiscussionInviteForm } from './discussion-invite-form';
import { DiscussionMembers } from './discussion-members';

const button = 'self-start rounded border border-slate-400 px-3 py-1';

/** Brief 20 B2 and D-168: one discussion — who is in it, its messages, inviting and removing, and leaving. */
export function DiscussionItem(props: { unitId: string; discussion: DiscussionSummary }) {
  const t = useText().services['communication-hub'].discussions;
  const formatTimestamp = useFormatTimestamp();
  const [open, setOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const d = props.discussion;
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <h3 className="font-semibold">{d.subject}</h3>
      <p className="text-sm text-slate-600">
        {fillText(t.startedBy, { name: d.startedByName, date: formatTimestamp(d.startedAt) })}
      </p>
      <DiscussionMembers discussion={d} />
      <button
        type="button"
        className={button}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? t.close : t.open}
      </button>
      {open && <ConversationThread path={`${discussionPath(d.id)}/messages`} />}
      {open && d.startedByMe && !inviting && (
        <button
          type="button"
          className={button}
          onClick={() => {
            setInviting(true);
          }}
        >
          {t.invite}
        </button>
      )}
      {inviting && (
        <DiscussionInviteForm
          unitId={props.unitId}
          discussion={d}
          onDone={() => {
            setInviting(false);
          }}
        />
      )}
    </li>
  );
}

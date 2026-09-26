import type { DiscussionSummary } from '../../../shared/communication-hub/conversation-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { discussionPath } from './conversations.api';
import { useHubAction } from './use-hub-action';

const button = 'rounded border border-slate-400 px-2 text-sm disabled:opacity-50';

/** D-168: who is in the discussion — the starter can remove others, and anyone else can leave. */
export function DiscussionMembers(props: { discussion: DiscussionSummary }) {
  const t = useText().services['communication-hub'];
  const { personId } = useActiveSession().context;
  const action = useHubAction();
  const d = props.discussion;
  const path = discussionPath(d.id);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{t.discussions.members}</span>
      <ul className="flex flex-wrap gap-2 text-sm">
        {d.members.map((m) => (
          <li key={m.personId} className="flex items-center gap-1">
            {m.name}
            {d.startedByMe && m.personId !== personId && (
              <button
                type="button"
                disabled={action.isPending}
                className={button}
                onClick={() => {
                  action.mutate({
                    path: `${path}/members/${m.personId}/remove`,
                    method: 'POST',
                    body: {},
                  });
                }}
              >
                {t.discussions.removeMember}
              </button>
            )}
          </li>
        ))}
      </ul>
      {!d.startedByMe && (
        <button
          type="button"
          disabled={action.isPending}
          className={`self-start ${button}`}
          onClick={() => {
            action.mutate({ path: `${path}/leave`, method: 'POST', body: {} });
          }}
        >
          {t.discussions.leave}
        </button>
      )}
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </div>
  );
}

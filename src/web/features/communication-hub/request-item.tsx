import { useState } from 'react';
import type { HubRequestRecord } from '../../../shared/communication-hub/conversation-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { ConversationThread } from './conversation-thread';
import { requestPath } from './conversations.api';
import { RequestHeading } from './request-heading';
import { useHubAction } from './use-hub-action';

const button = 'self-start rounded border border-slate-400 px-3 py-1 disabled:opacity-50';

/** Brief 20 B3 and D-160: one request — its replies, replying, and (for the asking branch) closing it. */
export function RequestItem(props: { unitId: string; request: HubRequestRecord; sends: boolean }) {
  const t = useText().services['communication-hub'];
  const close = useHubAction();
  const [open, setOpen] = useState(false);
  const r = props.request;
  const path = requestPath(props.unitId, r.id);
  const closed = r.status === 'Closed';
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <RequestHeading request={r} />
      <button
        type="button"
        className={button}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? t.requests.closeView : t.requests.open}
      </button>
      {open && (
        <ConversationThread
          path={`${path}/replies`}
          closed={closed ? t.requests.closedNote : undefined}
        />
      )}
      {open && r.direction === 'sent' && props.sends && !closed && (
        <button
          type="button"
          disabled={close.isPending}
          className={button}
          onClick={() => {
            close.mutate({ path: `${path}/close`, method: 'POST', body: {} });
          }}
        >
          {t.requests.closeRequest}
        </button>
      )}
      <ErrorAlert error={close.error} refusals={t.refusals} />
    </li>
  );
}

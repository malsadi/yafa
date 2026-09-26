import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { TextAreaField } from '../../components/text-area-field';
import { HubMessageItem } from './hub-message-item';
import { useHubAction } from './use-hub-action';
import { useMessages } from './use-conversations';

/** Brief 20 B1 to B3: a conversation's messages, oldest first, and writing one — unless it takes no more. */
export function ConversationThread(props: { path: string; closed?: string }) {
  const text = useText();
  const t = text.services['communication-hub'];
  const messages = useMessages(props.path);
  const send = useHubAction();
  const [body, setBody] = useState('');
  if (messages.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (messages.isError) return <ErrorAlert error={messages.error} refusals={t.refusals} />;
  return (
    <div className="flex flex-col gap-2">
      {messages.data.length === 0 && <p>{t.conversation.none}</p>}
      <ul className="flex flex-col gap-2">
        {messages.data.map((m) => (
          <HubMessageItem key={m.id} message={m} />
        ))}
      </ul>
      {props.closed ? (
        <p className="text-sm">{props.closed}</p>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send.mutate(
              { path: props.path, method: 'POST', body: { body } },
              {
                onSuccess: () => {
                  setBody('');
                },
              },
            );
          }}
        >
          <ErrorAlert error={send.error} refusals={t.refusals} />
          <TextAreaField label={t.conversation.write} value={body} onChange={setBody} />
          <button
            type="submit"
            disabled={send.isPending}
            className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {t.conversation.send}
          </button>
        </form>
      )}
    </div>
  );
}

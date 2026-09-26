import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { DiscussionForm } from './discussion-form';
import { DiscussionItem } from './discussion-item';
import { useDiscussions } from './use-conversations';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 B2 and D-159: the discussions the officer is in, and starting one. */
export function DiscussionsPage() {
  const text = useText();
  const t = text.services['communication-hub'];
  const unit = useHubUnit();
  const { context } = useActiveSession();
  // A hint (T-042): the portal decides each request itself.
  const starts = context.capabilities.includes('communication-hub.discussions.start');
  const [starting, setStarting] = useState(false);
  const discussions = useDiscussions();
  if (discussions.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (discussions.isError) return <ErrorAlert error={discussions.error} refusals={t.refusals} />;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.discussions.heading}</h2>
      {starts && !starting && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setStarting(true);
          }}
        >
          {t.discussions.start}
        </button>
      )}
      {starting && (
        <DiscussionForm
          unitId={unit.id}
          selfId={context.personId}
          onDone={() => {
            setStarting(false);
          }}
        />
      )}
      {discussions.data.length === 0 && <p>{t.discussions.none}</p>}
      <ul className="flex flex-col gap-3">
        {discussions.data.map((d) => (
          <DiscussionItem key={d.id} unitId={unit.id} discussion={d} />
        ))}
      </ul>
    </section>
  );
}

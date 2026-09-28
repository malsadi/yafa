import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { PagedList } from '../../components/paged-list';
import { DiscussionForm } from './discussion-form';
import { DiscussionItem } from './discussion-item';
import { useDiscussions } from './use-conversations';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 B2 and D-159: the discussions the officer is in, and starting one. */
export function DiscussionsPage() {
  const t = useText().services['communication-hub'];
  const unit = useHubUnit();
  const { context } = useActiveSession();
  // A hint (T-042): the portal decides each request itself.
  const starts = context.capabilities.includes('communication-hub.discussions.start');
  const [starting, setStarting] = useState(false);
  const [page, setPage] = useState(1);
  const discussions = useDiscussions(page);
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
      <PagedList
        query={discussions}
        none={t.discussions.none}
        refusals={t.refusals}
        onPage={setPage}
      >
        {(items) => (
          <ul className="flex flex-col gap-3">
            {items.map((d) => (
              <DiscussionItem key={d.id} unitId={unit.id} discussion={d} />
            ))}
          </ul>
        )}
      </PagedList>
    </section>
  );
}

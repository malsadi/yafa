import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { NoticeForm } from './notice-form';
import { NoticeList } from './notice-list';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 A1 and A2: the unit's Noticeboard — its notices and votes — and posting to it. */
export function NoticeboardPage() {
  const text = useText();
  const t = text.services['communication-hub'];
  const unit = useHubUnit();
  // Hints only (T-042): the portal decides each request itself.
  const manages = useActiveSession().context.capabilities.includes(
    'communication-hub.noticeboard.manage',
  );
  const [posting, setPosting] = useState(false);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.noticeboard.heading}</h2>
      {manages && !posting && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setPosting(true);
          }}
        >
          {t.noticeboard.post}
        </button>
      )}
      {posting && (
        <NoticeForm
          unitId={unit.id}
          onDone={() => {
            setPosting(false);
          }}
        />
      )}
      <NoticeList unitId={unit.id} manages={manages} />
    </section>
  );
}

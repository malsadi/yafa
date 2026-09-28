import { useState } from 'react';
import type { TimelineScope } from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { AchievementCard } from './achievement-card';
import { useTimeline } from './use-achievement-queries';

/** Brief 24 A2, A3 and D-217: one timeline's achievements, a page at a time. */
export function TimelineList(props: { unitId: string; scope: TimelineScope; records: boolean }) {
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const [page, setPage] = useState(1);
  const achievements = useTimeline(props.unitId, props.scope, page);
  return (
    <>
      <ErrorAlert error={achievements.error} refusals={t.refusals} />
      {achievements.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {achievements.data?.items.length === 0 && <p>{t.timeline.none}</p>}
      <ol className="flex flex-col gap-3">
        {achievements.data?.items.map((a) => (
          <AchievementCard
            key={a.id}
            achievement={a}
            showUnit={props.scope !== 'unit'}
            editable={props.records && a.unitId === props.unitId}
          />
        ))}
      </ol>
      {achievements.data && achievements.data.pageCount > 1 && (
        <PageNav
          page={achievements.data.page}
          pageCount={achievements.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </>
  );
}

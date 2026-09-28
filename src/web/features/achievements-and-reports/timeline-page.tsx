import { useState } from 'react';
import { Link } from 'react-router';
import type { TimelineScope } from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { TimelineList } from './timeline-list';
import { TimelineScopes } from './timeline-scopes';
import { useAchievementUnit } from './use-achievement-queries';

/**
 * Brief 24 A2, A3 and D-215: the unit's history in date order — or the
 * General Council's, or (for the General Council) every branch's together.
 */
export function TimelinePage() {
  const { unitId, isNational } = useAchievementUnit();
  const t = useText().services['achievements-and-reports'];
  const { context } = useActiveSession();
  const scopes: TimelineScope[] = isNational ? ['unit', 'all'] : ['unit', 'national'];
  const [scope, setScope] = useState<TimelineScope>('unit');
  // Hints only (T-042): the portal decides each request itself.
  const records = context.capabilities.includes('achievements-and-reports.achievements.record');
  return (
    <section className="flex flex-col gap-3">
      <TimelineScopes scopes={scopes} chosen={scope} onChoose={setScope} />
      {records && scope === 'unit' && (
        <Link
          to="/achievements-and-reports/achievements/new"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        >
          {t.timeline.record}
        </Link>
      )}
      <TimelineList key={scope} unitId={unitId} scope={scope} records={records} />
    </section>
  );
}

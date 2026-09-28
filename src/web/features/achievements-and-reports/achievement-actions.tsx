import { Link } from 'react-router';
import type { AchievementRecord } from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { achievementPath } from './achievements.api';
import { useAchievementAction } from './use-achievement-queries';

/** O-152: change it, or withdraw it from the timeline and bring it back. */
export function AchievementActions({ achievement }: { achievement: AchievementRecord }) {
  const t = useText().services['achievements-and-reports'];
  const action = useAchievementAction();
  const path = achievementPath(achievement.unitId, achievement.id);
  const withdrawn = achievement.withdrawnAt !== null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <Link
          to={`/achievements-and-reports/achievements/${achievement.id}/change`}
          className="rounded border border-slate-400 px-3 py-1"
        >
          {t.timeline.change}
        </Link>
        <ActionButton
          label={withdrawn ? t.timeline.restore : t.timeline.withdraw}
          disabled={action.isPending}
          onClick={() => {
            action.mutate({
              path: `${path}/${withdrawn ? 'restore' : 'withdraw'}`,
              method: 'POST',
              body: { version: achievement.version },
            });
          }}
        />
      </div>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </div>
  );
}

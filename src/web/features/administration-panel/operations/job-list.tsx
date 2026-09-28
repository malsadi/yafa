import type { SystemHealth } from '../../../../shared/administration-panel/system-health';
import { useFormatTimestamp } from '../../../app/language/use-format-timestamp';
import { useText } from '../../../app/language/use-text';
import { ActionButton } from '../../../components/action-button';
import { ErrorAlert } from '../../../components/error-alert';
import { fillText } from '../../../text/fill-text';
import { useOperationsAction } from './use-operations';

/** Brief 25 D1: each scheduled job's last run and outcome, and running it again. */
export function JobList({ jobs }: { jobs: SystemHealth['jobs'] }) {
  const admin = useText().services['administration-panel'];
  const t = admin.operations.health;
  const timestamp = useFormatTimestamp();
  const run = useOperationsAction();
  const outcome = (j: SystemHealth['jobs'][number]) => {
    if (!j.lastRunAt) return t.never;
    const result =
      j.outcome === 'failure' ? fillText(t.failure, { code: j.errorCode ?? '' }) : t.success;
    return `${fillText(t.lastRun, { date: timestamp(j.lastRunAt) })}, ${result}`;
  };
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold">{t.jobs}</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {jobs.map((j) => (
          <li key={j.jobName} className="flex flex-wrap items-center gap-2">
            <span>
              {fillText(t.jobLine, { job: j.jobName, schedule: j.schedule, outcome: outcome(j) })}
            </span>
            <ActionButton
              label={fillText(t.runAgain, { job: j.jobName })}
              disabled={run.isPending}
              onClick={() => {
                run.mutate({ path: `/system-health/jobs/${j.jobName}/run`, method: 'POST' });
              }}
            />
          </li>
        ))}
      </ul>
      <ErrorAlert error={run.error} refusals={admin.operations.refusals} />
    </section>
  );
}

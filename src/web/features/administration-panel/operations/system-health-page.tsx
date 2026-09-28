import { useFormatTimestamp } from '../../../app/language/use-format-timestamp';
import { useText } from '../../../app/language/use-text';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { fillText } from '../../../text/fill-text';
import { JobList } from './job-list';
import { StorageList } from './storage-list';
import { useSystemHealth } from './use-operations';

/** Brief 25 D1 and D-217 (O-168): jobs, undelivered phone alerts, and storage per unit. */
export function SystemHealthPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.operations.health;
  const timestamp = useFormatTimestamp();
  const health = useSystemHealth();
  const h = health.data;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens['system-health']}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      <ErrorAlert error={health.error} refusals={admin.operations.refusals} />
      {health.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {h && <JobList jobs={h.jobs} />}
      {h && (
        <section className="flex flex-col gap-1">
          <h2 className="font-semibold">
            {fillText(t.pushFailures, { count: h.pushFailures.count })}
          </h2>
          <ul className="text-sm">
            {h.pushFailures.latest.map((f) => (
              <li key={`${f.failedAt}-${f.alertKind}`}>
                {fillText(t.pushLine, {
                  date: timestamp(f.failedAt),
                  kind: f.alertKind,
                  status: f.lastStatus,
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
      {h && <StorageList storage={h.storage} />}
    </div>
  );
}

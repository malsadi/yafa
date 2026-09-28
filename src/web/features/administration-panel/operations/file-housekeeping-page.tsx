import { useFormatSize } from '../../../app/language/use-format-size';
import { useFormatTimestamp } from '../../../app/language/use-format-timestamp';
import { useText } from '../../../app/language/use-text';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { fillText } from '../../../text/fill-text';
import { StorageList } from './storage-list';
import { useFileHousekeeping } from './use-operations';

/** Brief 25 D5: storage used, and files kept in storage with no record. */
export function FileHousekeepingPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.operations.files;
  const timestamp = useFormatTimestamp();
  const size = useFormatSize();
  const report = useFileHousekeeping();
  const r = report.data;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens['file-housekeeping']}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      <ErrorAlert error={report.error} refusals={admin.operations.refusals} />
      {report.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {r && <StorageList storage={r.storage} />}
      {r && (
        <section className="flex flex-col gap-1">
          <h2 className="font-semibold">
            {fillText(t.orphans, { count: r.orphans.count, size: size(r.orphans.bytes) })}
          </h2>
          <p className="text-sm">
            {r.orphanAgeDays === null ? t.ageUnset : fillText(t.age, { days: r.orphanAgeDays })}
          </p>
          <ul className="text-sm" dir="ltr">
            {r.orphans.latest.map((o) => (
              <li key={o.key}>
                {fillText(t.orphanLine, {
                  date: timestamp(o.uploadedAt),
                  key: o.key,
                  size: size(o.size),
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

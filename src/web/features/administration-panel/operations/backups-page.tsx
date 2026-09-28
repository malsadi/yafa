import { useFormatSize } from '../../../app/language/use-format-size';
import { useFormatTimestamp } from '../../../app/language/use-format-timestamp';
import { useText } from '../../../app/language/use-text';
import { ActionButton } from '../../../components/action-button';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { fillText } from '../../../text/fill-text';
import { useBackups, useOperationsAction } from './use-operations';

/** Brief 25 D3: the backups kept, and a backup now. There is no restore button. */
export function BackupsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.operations.backups;
  const timestamp = useFormatTimestamp();
  const size = useFormatSize();
  const backups = useBackups();
  const now = useOperationsAction();
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens.backups}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      <ActionButton
        label={now.isPending ? t.taking : t.now}
        disabled={now.isPending}
        onClick={() => {
          now.mutate({ path: '/backups', method: 'POST' });
        }}
      />
      <ErrorAlert error={backups.error ?? now.error} refusals={admin.operations.refusals} />
      {backups.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {backups.data?.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-1 text-sm">
        {backups.data?.map((b) => (
          <li key={b.key}>
            {fillText(t.line, { date: timestamp(b.takenAt), size: size(b.size) })}
          </li>
        ))}
      </ul>
    </div>
  );
}

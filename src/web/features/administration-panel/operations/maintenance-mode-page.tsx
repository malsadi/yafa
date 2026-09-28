import { useText } from '../../../app/language/use-text';
import { ActionButton } from '../../../components/action-button';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useMaintenanceMode, useOperationsAction } from './use-operations';

/** Brief 25 D6: put the portal into read-only mode with a banner, and take it out again. */
export function MaintenanceModePage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.operations.maintenance;
  const mode = useMaintenanceMode();
  const change = useOperationsAction();
  const enabled = mode.data?.enabled ?? false;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens['maintenance-mode']}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      {mode.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {mode.data && <p className="font-medium">{enabled ? t.on : t.off}</p>}
      {mode.data && (
        <ActionButton
          label={enabled ? t.turnOff : t.turnOn}
          disabled={change.isPending}
          onClick={() => {
            change.mutate({
              path: '/maintenance-mode',
              method: 'PUT',
              body: { enabled: !enabled },
            });
          }}
        />
      )}
      <ErrorAlert error={mode.error ?? change.error} refusals={admin.operations.refusals} />
    </div>
  );
}

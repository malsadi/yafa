import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { CapabilitySections } from './capability-sections';
import { MatrixHeader } from './matrix-header';
import { MatrixHistory } from './matrix-history';
import { usePermissionsMatrix } from './use-permissions-matrix';

/** Brief 25 A3: the permissions matrix, editable, versioned, fixed rules locked. */
export function PermissionsMatrixPage() {
  const text = useText();
  const { matrix, versions, cell, restore, changedElsewhere } = usePermissionsMatrix();
  if (matrix.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (matrix.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const { version, roles, capabilities, grants } = matrix.data;
  const busy = cell.isPending || restore.isPending;
  return (
    <div className="flex flex-col gap-6">
      <MatrixHeader version={version} busy={busy} changedElsewhere={changedElsewhere} />
      <CapabilitySections
        capabilities={capabilities}
        roles={roles}
        grants={grants}
        busy={busy}
        onChange={(capability, roleId, scopes) => {
          cell.mutate({ roleId, capability, scopes, expectedVersion: version });
        }}
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          {text.services['administration-panel'].permissionsMatrix.history}
        </h2>
        <MatrixHistory
          versions={versions.data ?? []}
          roles={roles}
          currentVersion={version}
          busy={busy}
          onRestore={(fromVersion) => {
            restore.mutate({ fromVersion, expectedVersion: version });
          }}
        />
      </section>
    </div>
  );
}

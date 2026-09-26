import type { ResourceKind } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { AddResourceForm } from './add-resource-form';
import { ResourceItem } from './resource-item';
import { resourcesPath } from './resources.api';
import { useLibraryDownload } from './use-library-download';
import { useLibraryRetirement } from './use-library-retirement';
import { useLibraryUnit } from './use-library-unit';
import { resourcesKey, useResources } from './use-resources';

/** Brief 16 A1 or A2: the unit's templates or guides and the General Council's (A3). */
export function ResourcesPage({ kind }: { kind: ResourceKind }) {
  const unitId = useLibraryUnit();
  const text = useText();
  const t = text.services['resources-library'].resources;
  const { context } = useActiveSession();
  const { list, add, change, replace } = useResources(unitId);
  const retirement = useLibraryRetirement(resourcesKey(unitId));
  const download = useLibraryDownload();
  // A hint only (T-042): the portal decides each change itself.
  const mayManage = context.capabilities.includes('resources-library.resources.manage');
  if (list.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (list.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const items = list.data.filter((r) => r.kind === kind);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.headings[kind]}</h2>
      <p className="text-sm text-slate-600">{t.explanation[kind]}</p>
      <ErrorAlert error={retirement.error ?? download.error} refusals={t.refusals} />
      {items.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((resource) => (
          <ResourceItem
            key={resource.id}
            unitId={unitId}
            resource={resource}
            manages={mayManage && resource.unitId === unitId}
            actions={{ change, replace }}
            onDownload={(path, fileName) => {
              download.mutate({ path, fileName });
            }}
            onSetRetired={(retire) => {
              retirement.mutate({
                itemPath: `${resourcesPath(unitId)}/${resource.id}`,
                version: resource.version,
                retire,
              });
            }}
          />
        ))}
      </ul>
      {mayManage && <AddResourceForm kind={kind} add={add} />}
    </section>
  );
}

import type { ResourceRecord } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { ItemBadges } from './item-badges';
import { ResourceActions } from './resource-actions';
import { resourcesPath } from './resources.api';
import { RetireButton } from './retire-button';
import type { useResources } from './use-resources';

interface ItemProps {
  unitId: string;
  resource: ResourceRecord;
  /** Whether this officer may change it: their own unit's, with the capability. */
  manages: boolean;
  actions: Pick<ReturnType<typeof useResources>, 'change' | 'replace'>;
  onDownload: (path: string, fileName: string) => void;
  onSetRetired: (retire: boolean) => void;
}

/** Brief 16 A1 to A3: one template or guide, to download, and to change where allowed. */
export function ResourceItem({
  unitId,
  resource,
  manages,
  actions,
  onDownload,
  onSetRetired,
}: ItemProps) {
  const t = useText().services['resources-library'].resources;
  const file = `${resourcesPath(unitId)}/${resource.id}/file`;
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">{resource.title}</span>
        <span className="text-sm text-slate-600">{t.languages[resource.language]}</span>
        <ItemBadges national={resource.national} retired={resource.retiredAt !== null} labels={t} />
      </div>
      {resource.description && (
        <p className="whitespace-pre-line text-sm">{resource.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-slate-400 px-3 py-1"
          onClick={() => {
            onDownload(file, resource.fileName);
          }}
        >
          {t.download}
        </button>
        {manages && (
          <>
            <ResourceActions resource={resource} actions={actions} />
            <RetireButton
              retired={resource.retiredAt !== null}
              busy={false}
              labels={t}
              onSetRetired={onSetRetired}
            />
          </>
        )}
      </div>
    </li>
  );
}

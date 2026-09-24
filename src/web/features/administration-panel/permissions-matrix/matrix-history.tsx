import type {
  MatrixRole,
  MatrixVersionSummary,
} from '../../../../shared/administration-panel/permissions-matrix';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { capabilityName } from './capability-name';
import { MatrixVersionItem } from './matrix-version-item';

interface MatrixHistoryProps {
  versions: MatrixVersionSummary[];
  roles: MatrixRole[];
  currentVersion: number;
  busy: boolean;
  onRestore: (fromVersion: number) => void;
}

/** Brief 25 A3: every version, newest first, each restorable. */
export function MatrixHistory(props: MatrixHistoryProps) {
  const { language } = useLanguage();
  const text = useText();
  const t = text.services['administration-panel'].permissionsMatrix;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  const roleName = (id: string) => {
    const role = props.roles.find((r) => r.id === id);
    return role ? { en: role.nameEn, ar: role.nameAr }[language] : id;
  };
  const describe = (version: MatrixVersionSummary) =>
    version.change.kind === 'cell'
      ? fillText(t.changedCell, {
          capability: capabilityName(text, version.change.capability),
          role: roleName(version.change.roleId),
        })
      : fillText(t.restoredVersion, { number: version.change.fromVersion });
  if (props.versions.length === 0) return <p>{t.noHistory}</p>;
  return (
    <ol className="flex flex-col gap-3">
      {[...props.versions].reverse().map((version) => (
        <MatrixVersionItem
          key={version.number}
          version={version}
          date={formatDateLondon(version.createdAt, locale, {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
          description={describe(version)}
          isCurrent={version.number === props.currentVersion}
          busy={props.busy}
          onRestore={() => {
            props.onRestore(version.number);
          }}
        />
      ))}
    </ol>
  );
}

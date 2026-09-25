import type { SystemAdministratorListItem } from '../../../../shared/administration-panel/system-administrators';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface AdministratorListProps {
  administrators: SystemAdministratorListItem[];
  canRemove: boolean;
  busy: boolean;
  onRemove: (personId: string) => void;
}

/** Brief 25 A1: each administrator, with a remove button while more than two remain (P21). */
export function AdministratorList(props: AdministratorListProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].systemAdministrators;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  return (
    <ul className="flex flex-col gap-2">
      {props.administrators.map((admin) => (
        <li
          key={admin.personId}
          className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-300 p-3"
        >
          <div>
            <p className="font-medium">{admin.name}</p>
            <p className="text-sm text-slate-600">
              {admin.email} ·{' '}
              {fillText(t.appointedOn, {
                date: formatDateLondon(admin.appointedAt, locale, { dateStyle: 'long' }),
              })}
            </p>
          </div>
          {props.canRemove && (
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              disabled={props.busy}
              onClick={() => {
                props.onRemove(admin.personId);
              }}
            >
              {fillText(t.remove, { name: admin.name })}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

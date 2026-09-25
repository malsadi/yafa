import type { OfficerAccount } from '../../../../shared/administration-panel/account-state';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { accountActionsFor, type OfficerAccountAction } from './account-actions-for';

interface OfficerAccountRowProps {
  account: OfficerAccount;
  busy: boolean;
  onAction: (action: OfficerAccountAction) => void;
}

/** Brief 25 A2: one person, their access state, and what can be done. */
export function OfficerAccountRow({ account, busy, onAction }: OfficerAccountRowProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].officerAccounts;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-300 p-3">
      <div>
        <p className="font-medium">{account.name}</p>
        <p className="text-sm text-slate-600">{account.email}</p>
        <p className="text-sm">
          {t.states[account.state]}
          {account.lastInvitedAt &&
            ` · ${fillText(t.lastInvited, {
              date: formatDateLondon(account.lastInvitedAt, locale, { dateStyle: 'long' }),
            })}`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {accountActionsFor(account.state).map((action) => (
          <button
            key={action}
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            disabled={busy}
            aria-label={fillText(t.actionFor[action], { name: account.name })}
            onClick={() => {
              onAction(action);
            }}
          >
            {t.actions[action]}
          </button>
        ))}
      </div>
    </li>
  );
}

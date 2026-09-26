import { Link } from 'react-router';
import type { AdminTextKey } from '../../../../shared/administration-panel/admin-texts';
import type { ChecklistItem } from '../../../../shared/administration-panel/setup-checklist';
import { RequiredSettingForm } from './required-setting-form';

// Where each kind of item is configured, for the kinds whose screen exists.
const CONFIGURED_AT: Partial<Record<ChecklistItem['kind'], string>> = {
  designation: '/admin/organisation/roles',
};

// Where each of the administrator's texts is written (25 C4, C5).
const TEXT_WRITTEN_AT: Record<AdminTextKey, string> = {
  'iphone-install-guide': '/admin/configuration/notifications',
  'access-not-active': '/admin/configuration/texts',
  help: '/admin/configuration/texts',
};

interface ChecklistEntryProps {
  item: ChecklistItem;
  label: string;
  canSet: boolean;
  busy: boolean;
  onSet: (key: string, value: unknown) => void;
}

/** One item waiting: a link to where it is configured, or a setting set in place (D-074). */
export function ChecklistEntry({ item, label, canSet, busy, onSet }: ChecklistEntryProps) {
  const to =
    item.kind === 'setting' && item.input.kind === 'branding'
      ? '/admin/configuration/branding'
      : item.kind === 'text'
        ? TEXT_WRITTEN_AT[item.key]
        : CONFIGURED_AT[item.kind];
  return (
    <li className="flex flex-col gap-1">
      {to ? (
        <Link to={to} className="underline">
          {label}
        </Link>
      ) : (
        <span>{label}</span>
      )}
      {item.kind === 'setting' && canSet && (
        <RequiredSettingForm
          settingKey={item.key}
          input={item.input}
          label={label}
          busy={busy}
          onSave={(value) => {
            onSet(item.key, value);
          }}
        />
      )}
    </li>
  );
}

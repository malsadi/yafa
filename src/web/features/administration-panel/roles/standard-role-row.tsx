import { useState } from 'react';
import type { RoleNames, RoleRecord } from '../../../../shared/committee-register/role-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { RoleNameForm } from './role-name-form';

interface StandardRoleRowProps {
  role: RoleRecord;
  busy: boolean;
  onRename: (names: RoleNames) => void;
}

/** Brief 14 B2: one standard role, with its designation if it has one. */
export function StandardRoleRow({ role, busy, onRename }: StandardRoleRowProps) {
  const { language } = useLanguage();
  const admin = useText().services['administration-panel'];
  const t = admin.roles;
  const [editing, setEditing] = useState(false);
  const name = { en: role.nameEn, ar: role.nameAr }[language];
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-medium">{name}</span>
          {role.designation && ` · ${admin.designations[role.designation]}`}
        </p>
        {!editing && (
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            aria-label={fillText(t.renameRole, { name })}
            onClick={() => {
              setEditing(true);
            }}
          >
            {t.rename}
          </button>
        )}
      </div>
      {editing && (
        <RoleNameForm
          initial={{ nameEn: role.nameEn, nameAr: role.nameAr }}
          busy={busy}
          submitLabel={t.save}
          onSubmit={(names) => {
            onRename(names);
            setEditing(false);
          }}
          onCancel={() => {
            setEditing(false);
          }}
        />
      )}
    </li>
  );
}

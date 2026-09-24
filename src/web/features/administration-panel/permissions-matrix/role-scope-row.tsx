import type { MatrixRole } from '../../../../shared/administration-panel/permissions-matrix';
import type { PermissionScope } from '../../../../shared/core/permission-scope';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

interface RoleScopeRowProps {
  role: MatrixRole;
  allowedScopes: readonly PermissionScope[];
  heldScopes: readonly PermissionScope[];
  disabled: boolean;
  onChange: (scopes: PermissionScope[]) => void;
}

/** One role's scopes for one capability: a tick box per allowed scope. */
export function RoleScopeRow(props: RoleScopeRowProps) {
  const { language } = useLanguage();
  const text = useText().services['administration-panel'];
  const name = { en: props.role.nameEn, ar: props.role.nameAr }[language];
  const toggle = (scope: PermissionScope, on: boolean) => {
    const next = on
      ? [...props.heldScopes, scope]
      : props.heldScopes.filter((held) => held !== scope);
    props.onChange(next);
  };
  return (
    <li className="flex flex-col gap-2 border-t py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <span dir="auto">
        {name}
        {props.role.unitId && (
          <span className="ms-2 text-sm text-slate-600">({text.permissionsMatrix.branchRole})</span>
        )}
      </span>
      <span className="flex flex-wrap gap-4">
        {props.allowedScopes.map((scope) => (
          <label key={scope} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5"
              disabled={props.disabled}
              checked={props.heldScopes.includes(scope)}
              onChange={(event) => {
                toggle(scope, event.target.checked);
              }}
            />
            {text.scopes[scope]}
          </label>
        ))}
      </span>
    </li>
  );
}

import type {
  MatrixGrant,
  MatrixRole,
} from '../../../../shared/administration-panel/permissions-matrix';
import type { CapabilityDefinition } from '../../../../shared/core/capability-definition';
import type { PermissionScope } from '../../../../shared/core/permission-scope';
import { useText } from '../../../app/language/use-text';
import { capabilityName } from '../capability-name';
import { FixedRuleNote } from './fixed-rule-note';
import { RoleScopeRow } from './role-scope-row';

interface CapabilityCardProps {
  definition: CapabilityDefinition;
  roles: MatrixRole[];
  grants: MatrixGrant[];
  saving: boolean;
  onChange: (roleId: string, scopes: PermissionScope[]) => void;
}

/** One capability: its fixed rule, or each role's scopes to edit (brief 25 A3). */
export function CapabilityCard(props: CapabilityCardProps) {
  const text = useText();
  const matrixText = text.services['administration-panel'].permissionsMatrix;
  const { definition } = props;
  const held = (roleId: string) =>
    props.grants
      .filter((grant) => grant.roleId === roleId && grant.capability === definition.capability)
      .map((grant) => grant.scope);
  return (
    <details className="rounded border bg-white">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
        <span className="font-medium">{capabilityName(text, definition.capability)}</span>
        {definition.fixedGrants && (
          <span className="rounded-full border px-2 text-sm">{matrixText.fixedRule}</span>
        )}
      </summary>
      <div className="border-t px-4 pb-2">
        {definition.fixedGrants ? (
          <div className="py-3">
            <FixedRuleNote fixedGrants={definition.fixedGrants} />
          </div>
        ) : props.roles.length === 0 ? (
          <p className="py-3">{matrixText.noRoles}</p>
        ) : (
          <ul>
            {props.roles.map((role) => (
              <RoleScopeRow
                key={role.id}
                role={role}
                allowedScopes={definition.allowedScopes}
                heldScopes={held(role.id)}
                disabled={props.saving}
                onChange={(scopes) => {
                  props.onChange(role.id, scopes);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

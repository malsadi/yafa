import type { FixedGrant } from '../../../../shared/core/capability-definition';
import { useText } from '../../../app/language/use-text';

/** Brief 7.3: a fixed rule, shown locked with who holds it and where. */
export function FixedRuleNote({ fixedGrants }: { fixedGrants: readonly FixedGrant[] }) {
  const text = useText().services['administration-panel'];
  return (
    <div className="text-slate-700">
      <p>{text.permissionsMatrix.heldBy}</p>
      <ul className="list-disc ps-6">
        {fixedGrants.map((grant) => (
          <li key={grant.designation}>
            {text.designations[grant.designation]} ({text.scopes[grant.scope]})
          </li>
        ))}
      </ul>
    </div>
  );
}

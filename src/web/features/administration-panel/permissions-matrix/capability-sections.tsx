import type {
  MatrixGrant,
  MatrixRole,
} from '../../../../shared/administration-panel/permissions-matrix';
import type { CapabilityDefinition } from '../../../../shared/core/capability-definition';
import type { PermissionScope } from '../../../../shared/core/permission-scope';
import { SERVICES } from '../../../../shared/core/services';
import { useText } from '../../../app/language/use-text';
import { CapabilityCard } from './capability-card';

interface CapabilitySectionsProps {
  capabilities: readonly CapabilityDefinition[];
  roles: MatrixRole[];
  grants: MatrixGrant[];
  busy: boolean;
  onChange: (capability: string, roleId: string, scopes: PermissionScope[]) => void;
}

/** The capabilities grouped by service, in brief section 3.1's order. */
export function CapabilitySections(props: CapabilitySectionsProps) {
  const text = useText();
  const sections = SERVICES.map((service) => ({
    slug: service.slug,
    capabilities: props.capabilities.filter((c) => c.capability.startsWith(`${service.slug}.`)),
  })).filter((section) => section.capabilities.length > 0);
  return sections.map((section) => (
    <section key={section.slug} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{text.services[section.slug].name}</h2>
      {section.capabilities.map((definition) => (
        <CapabilityCard
          key={definition.capability}
          definition={definition}
          roles={props.roles}
          grants={props.grants}
          saving={props.busy}
          onChange={(roleId, scopes) => {
            props.onChange(definition.capability, roleId, scopes);
          }}
        />
      ))}
    </section>
  ));
}

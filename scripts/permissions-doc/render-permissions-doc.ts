import { isAdministrationPanelCapability } from '../../src/shared/core/administration-panel-capability';
import type { CapabilityDefinition } from '../../src/shared/core/capability-definition';

export interface CatalogueSection {
  service: string;
  capabilities: readonly CapabilityDefinition[];
}

function whoHoldsIt(definition: CapabilityDefinition): string {
  if (definition.fixedGrants) {
    const holders = definition.fixedGrants.map((grant) => `${grant.designation} (${grant.scope})`);
    return `**Fixed** (brief 7.3): ${holders.join('; ')}. Locked in the matrix.`;
  }
  if (isAdministrationPanelCapability(definition.capability)) {
    return 'System administrators always (D-046); anyone else through the permissions matrix.';
  }
  return 'The permissions matrix.';
}

function cell(text: string): string {
  return text.replaceAll('|', '\\|');
}

/**
 * `docs/permissions.md` (brief sections 7.2 and 26, Phase 1), rendered from
 * the capability catalogue: names, meanings, scopes and who holds each.
 * Never assigns a matrix capability to a role; the matrix is data.
 */
export function renderPermissionsDoc(sections: readonly CatalogueSection[]): string {
  const parts = [
    '# Capability catalogue',
    '',
    'Every capability the portal checks, with its meaning and the scopes a grant may be made at (brief section 7.2). The code checks capabilities, never role names. Which role holds which capability is data: the permissions matrix, filled in by the data administrator in the Administration panel (15 A3). The only exceptions are the fixed rules of brief section 7.3, which the code decides by role designation and the matrix shows locked.',
    '',
    'Scopes: **own unit** (the unit of the term that gives the capability), **all units**, **national content**.',
    '',
    'Generated from `src/shared/*/capabilities.ts`. Do not edit by hand: run `npm run permissions-doc`.',
  ];
  for (const section of sections) {
    parts.push(
      '',
      `## ${section.service}`,
      '',
      '| Capability | Meaning | Scopes | Who holds it |',
      '|---|---|---|---|',
    );
    for (const definition of section.capabilities) {
      parts.push(
        `| \`${definition.capability}\` | **${cell(definition.label)}.** ${cell(definition.description)} | ${definition.allowedScopes.join(', ')} | ${cell(whoHoldsIt(definition))} |`,
      );
    }
  }
  return `${parts.join('\n')}\n`;
}

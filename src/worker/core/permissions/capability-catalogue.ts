import { capabilityNameSchema, type CapabilityDefinition } from './capability-catalogue.schema';

const definitions = new Map<string, CapabilityDefinition>();

/**
 * Registers one capability the portal uses: its meaning and the scopes a
 * grant for it may be made at (brief section 7.2). Every service registers
 * its own capabilities as it is built (T-039) — this module never invents
 * one. Documented in `docs/permissions.md` (Phase 1 deliverable).
 */
export function registerCapability(definition: CapabilityDefinition): void {
  capabilityNameSchema.parse(definition.capability);
  for (const fixed of definition.fixedGrants ?? []) {
    if (!definition.allowedScopes.includes(fixed.scope)) {
      throw new Error(`Fixed grant scope not allowed for ${definition.capability}: ${fixed.scope}`);
    }
  }
  if (definitions.has(definition.capability)) {
    throw new Error(`Capability already registered: ${definition.capability}`);
  }
  definitions.set(definition.capability, definition);
}

export function getCapabilityDefinition(capability: string): CapabilityDefinition | undefined {
  return definitions.get(capability);
}

export function listCapabilityDefinitions(): readonly CapabilityDefinition[] {
  return Array.from(definitions.values());
}

/** Test-only: keeps one test file's registrations from leaking into another. */
export function resetCapabilityCatalogueForTests(): void {
  definitions.clear();
}

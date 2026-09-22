import { settingKeySchema, type SettingDefinition } from './setting-definition.schema';

const definitions = new Map<string, SettingDefinition>();

/**
 * Registers a setting: key, label, description, its Zod schema, whether it
 * is required before the owning service can be used, and whether a unit may
 * override the national value (brief section 8.1). Every service registers
 * its own settings in its `settings.ts`; there is no default value here.
 */
export function registerSetting(definition: SettingDefinition): void {
  settingKeySchema.parse(definition.key);
  if (definitions.has(definition.key)) {
    throw new Error(`Setting already registered: ${definition.key}`);
  }
  definitions.set(definition.key, definition);
}

export function getSettingDefinition(key: string): SettingDefinition | undefined {
  return definitions.get(key);
}

export function listSettingDefinitions(): readonly SettingDefinition[] {
  return Array.from(definitions.values());
}

/** Test-only: keeps one test file's registrations from leaking into another. */
export function resetSettingsRegistryForTests(): void {
  definitions.clear();
}

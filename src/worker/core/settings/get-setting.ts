import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import { getSettingDefinition } from './settings-registry';
import { readStoredValue } from './settings-repo';

export type SettingResolution<Value> =
  { status: 'configured'; value: Value } | { status: 'not-configured' };

/**
 * Resolves a setting: unit override, then the national value, then
 * "not configured" (brief section 8.1). Never falls back to a value coded
 * in the application — that is exactly what section 8.1 forbids.
 */
export async function getSetting<Value>(
  db: D1Database,
  key: string,
  unitId?: string,
): Promise<SettingResolution<Value>> {
  const definition = getSettingDefinition(key);
  if (!definition) {
    throw new Error(`Setting is not registered: ${key}`);
  }

  if (unitId && definition.unitOverrideAllowed) {
    const unitValue = await readStoredValue(db, key, unitId);
    if (unitValue !== null) {
      return {
        status: 'configured',
        value: definition.schema.parse(JSON.parse(unitValue)) as Value,
      };
    }
  }

  const nationalValue = await readStoredValue(db, key, NATIONAL_SCOPE);
  if (nationalValue === null) {
    return { status: 'not-configured' };
  }
  return {
    status: 'configured',
    value: definition.schema.parse(JSON.parse(nationalValue)) as Value,
  };
}

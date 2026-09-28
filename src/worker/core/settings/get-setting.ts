import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import { parseStoredValue } from './parse-stored-value';
import { getSettingDefinition } from './settings-registry';
import { readStoredValue } from './settings-repo';

export type SettingResolution<Value> =
  { status: 'configured'; value: Value } | { status: 'not-configured' };

/**
 * Resolves a setting: unit override, then the national value, then
 * "not configured" (brief section 8.1). A stored value its rules no longer
 * accept is not configured too (D-218). Never falls back to a value coded
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
      const unit = parseStoredValue(definition, unitValue);
      return unit.valid
        ? { status: 'configured', value: unit.value as Value }
        : { status: 'not-configured' };
    }
  }

  const nationalValue = await readStoredValue(db, key, NATIONAL_SCOPE);
  if (nationalValue === null) {
    return { status: 'not-configured' };
  }
  const national = parseStoredValue(definition, nationalValue);
  return national.valid
    ? { status: 'configured', value: national.value as Value }
    : { status: 'not-configured' };
}

import type { SettingDefinition } from './setting-definition.schema';

/**
 * A stored value, read through its setting's current rules. A value those
 * rules no longer accept — a file type since barred (D-218), say — counts
 * as not set, so the action waits and the administrator sets it again
 * (rule 5), rather than the request failing.
 */
export function parseStoredValue(
  definition: SettingDefinition,
  raw: string,
): { valid: true; value: unknown } | { valid: false } {
  const parsed = definition.schema.safeParse(JSON.parse(raw));
  return parsed.success ? { valid: true, value: parsed.data } : { valid: false };
}

import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import { getSettingDefinition } from './settings-registry';
import { writeSettingValue } from './write-setting-value';

export interface SetSettingParams {
  key: string;
  value: unknown;
  /** Omit for the national/portal-wide value. */
  unitId?: string;
  actorPersonId: string;
}

/**
 * Sets a setting's value, recording history and an audit entry in the same
 * batch (brief section 8.1). Rejects a unit value when the setting's
 * registration does not allow a unit override, and a value that fails the
 * setting's own schema.
 */
export async function setSetting(db: D1Database, params: SetSettingParams): Promise<void> {
  const definition = getSettingDefinition(params.key);
  if (!definition) {
    throw new Error(`Setting is not registered: ${params.key}`);
  }
  if (params.unitId && !definition.unitOverrideAllowed) {
    throw new Error(`Setting does not allow a unit override: ${params.key}`);
  }

  const validatedValue = definition.schema.parse(params.value);

  await writeSettingValue(db, {
    key: params.key,
    scope: params.unitId ?? NATIONAL_SCOPE,
    valueJson: JSON.stringify(validatedValue),
    actorPersonId: params.actorPersonId,
  });
}

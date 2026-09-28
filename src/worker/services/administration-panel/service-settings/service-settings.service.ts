import type { ServiceSettingsView } from '../../../../shared/administration-panel/service-settings';
import { isNationalScope } from '../../../../shared/core/national-scope';
import type { ServiceSlug } from '../../../../shared/core/services';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import {
  describeSettingInput,
  getSettingDefinition,
  listSettingDefinitions,
  parseStoredValue,
} from '../../../core/settings';
import { listRoles, listUnits } from '../../committee-register';
import { listStoredValues } from './service-settings.repo';

const CAPABILITY = 'administration-panel.service-settings.manage';

export async function requireSettingsCapability(db: D1Database, ctx: RequestContext) {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** A registered setting, or 404: only registered settings exist (brief 8.1). */
export function requireRegistered(key: string) {
  const definition = getSettingDefinition(key);
  if (!definition) throw new NotFoundError('service-settings.not-registered');
  return definition;
}

/**
 * Brief 25 C1: every registered setting, grouped by its service on screen,
 * with its national value (null while not configured) and unit overrides.
 */
export async function getServiceSettings(
  db: D1Database,
  ctx: RequestContext,
): Promise<ServiceSettingsView> {
  await requireSettingsCapability(db, ctx);
  const [stored, units, roles] = await Promise.all([
    listStoredValues(db),
    listUnits(db),
    listRoles(db),
  ]);
  const settings = listSettingDefinitions().map((definition) => {
    // D-218: a value its rules no longer accept shows as not set.
    const rows = stored.flatMap((row) => {
      if (row.key !== definition.key) return [];
      const parsed = parseStoredValue(definition, row.value);
      return parsed.valid ? [{ scope: row.scope, value: parsed.value }] : [];
    });
    const national = rows.find((row) => isNationalScope(row.scope));
    return {
      key: definition.key,
      // A setting key starts with its service's slug (settingKeySchema).
      service: definition.key.split('.')[0] as ServiceSlug,
      required: definition.required,
      unitOverrideAllowed: definition.unitOverrideAllowed,
      input: describeSettingInput(definition),
      national: national ? national.value : null,
      overrides: rows
        .filter((row) => !isNationalScope(row.scope))
        .map((row) => ({ unitId: row.scope, value: row.value })),
    };
  });
  const named = ({ id, nameEn, nameAr }: { id: string; nameEn: string; nameAr: string }) => ({
    id,
    nameEn,
    nameAr,
  });
  return { settings, units: units.map(named), roles: roles.map(named) };
}

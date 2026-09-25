import type { SettingHistoryEntry } from '../../../../shared/administration-panel/service-settings';
import { isNationalScope } from '../../../../shared/core/national-scope';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { getSetting, removeUnitOverride, setSetting } from '../../../core/settings';
import { listUnits } from '../../committee-register';
import { findHistoryEntry, listSettingHistory } from './service-settings.repo';
import { requireRegistered, requireSettingsCapability } from './service-settings.service';

async function requireOverridableUnit(db: D1Database, key: string, unitId: string) {
  if (!requireRegistered(key).unitOverrideAllowed) {
    throw new ConflictError('service-settings.no-unit-override');
  }
  if (!(await listUnits(db)).some((unit) => unit.id === unitId)) {
    throw new NotFoundError('branches.not-found');
  }
}

/** Brief 25 C1 and 8.1: set the national value, or a unit's override where allowed. */
export async function setServiceSetting(
  db: D1Database,
  ctx: RequestContext,
  params: { key: string; value: unknown; unitId?: string },
): Promise<void> {
  await requireSettingsCapability(db, ctx);
  requireRegistered(params.key);
  if (params.unitId) await requireOverridableUnit(db, params.key, params.unitId);
  await setSetting(db, { ...params, actorPersonId: ctx.personId });
}

/** Brief 8.1: remove a unit's override, so the national value applies again. */
export async function removeServiceSettingOverride(
  db: D1Database,
  ctx: RequestContext,
  params: { key: string; unitId: string },
): Promise<void> {
  await requireSettingsCapability(db, ctx);
  await requireOverridableUnit(db, params.key, params.unitId);
  if ((await getSetting(db, params.key, params.unitId)).status === 'not-configured') {
    throw new NotFoundError('service-settings.no-override');
  }
  await removeUnitOverride(db, { ...params, actorPersonId: ctx.personId });
}

/** Brief 8.1: every change to one setting, with who and when. */
export async function getServiceSettingHistory(
  db: D1Database,
  ctx: RequestContext,
  key: string,
): Promise<SettingHistoryEntry[]> {
  await requireSettingsCapability(db, ctx);
  requireRegistered(key);
  return listSettingHistory(db, key);
}

/**
 * Brief 8.1: "Any earlier value can be restored." Restoring sets that value
 * again at the same scope, as a new change, checked against the setting's
 * schema as it is now. A removed override is restored by removing it again.
 */
export async function restoreServiceSetting(
  db: D1Database,
  ctx: RequestContext,
  params: { key: string; historyId: string },
): Promise<void> {
  await requireSettingsCapability(db, ctx);
  requireRegistered(params.key);
  const entry = await findHistoryEntry(db, params.key, params.historyId);
  if (!entry) throw new NotFoundError('service-settings.history-not-found');
  const unitId = isNationalScope(entry.scope) ? undefined : entry.scope;
  if (entry.newValue === null && unitId) {
    await removeServiceSettingOverride(db, ctx, { key: params.key, unitId });
    return;
  }
  await setSetting(db, {
    key: params.key,
    value: entry.newValue,
    unitId,
    actorPersonId: ctx.personId,
  });
}

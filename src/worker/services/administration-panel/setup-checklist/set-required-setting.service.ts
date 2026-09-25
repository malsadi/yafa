import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { getSetting, getSettingDefinition, setSetting } from '../../../core/settings';

const CAPABILITY = 'administration-panel.setup-checklist.manage';

/**
 * D-074: the set-up checklist sets a required setting that is not yet
 * configured — its portal-wide value, checked against the setting's own
 * schema, with history and an audit entry (brief 8.1). Changing a value
 * already set is the Service settings screen's job (25 C1, Phase 2).
 */
export async function setRequiredSetting(
  db: D1Database,
  ctx: RequestContext,
  params: { key: string; value: unknown },
): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
  const definition = getSettingDefinition(params.key);
  if (!definition?.required) throw new NotFoundError('setup-checklist.not-a-required-setting');
  if ((await getSetting(db, params.key)).status === 'configured') {
    throw new ConflictError('setup-checklist.already-set');
  }
  await setSetting(db, { key: params.key, value: params.value, actorPersonId: ctx.personId });
}

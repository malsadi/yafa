import type { AlertType } from '../../../../shared/communication-hub/alert-types';
import type { NotificationsView } from '../../../../shared/administration-panel/notifications';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { getSetting, setSetting } from '../../../core/settings';
import { findAdminText } from '../admin-texts/admin-texts.repo';
import { writeAdminText } from '../admin-texts/admin-texts.service';

const CAPABILITY = 'administration-panel.notifications.manage';
const ALERT_TYPES_SETTING = 'communication-hub.alert_types_for_new_officers';

async function requireNotificationsCapability(db: D1Database, ctx: RequestContext) {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** Brief 25 C4: what is set now; each part is null until the administrator sets it. */
export async function getNotifications(
  db: D1Database,
  ctx: RequestContext,
): Promise<NotificationsView> {
  await requireNotificationsCapability(db, ctx);
  const [alertTypes, installGuide] = await Promise.all([
    getSetting<AlertType[]>(db, ALERT_TYPES_SETTING),
    findAdminText(db, 'iphone-install-guide'),
  ]);
  return {
    alertTypesForNewOfficers: alertTypes.status === 'configured' ? alertTypes.value : null,
    installGuide,
  };
}

/** Brief 20 and 25 C4: the alert types new officers start with, through the settings registry. */
export async function setAlertTypesForNewOfficers(
  db: D1Database,
  ctx: RequestContext,
  types: string[],
): Promise<void> {
  await requireNotificationsCapability(db, ctx);
  await setSetting(db, { key: ALERT_TYPES_SETTING, value: types, actorPersonId: ctx.personId });
}

/** Brief 20 build notes and 25 C4: the iPhone install guide, shown where push needs it. */
export async function setInstallGuide(
  db: D1Database,
  ctx: RequestContext,
  text: { textEn: string; textAr: string | null },
) {
  await requireNotificationsCapability(db, ctx);
  return writeAdminText(db, { key: 'iphone-install-guide', ...text, actorPersonId: ctx.personId });
}

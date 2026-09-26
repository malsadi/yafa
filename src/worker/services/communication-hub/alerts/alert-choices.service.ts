import {
  ALERT_TYPES_ALWAYS_ON,
  type AlertType,
  type SwitchableAlertType,
} from '../../../../shared/communication-hub/alert-types';
import type { AlertChoicesView } from '../../../../shared/communication-hub/alert-choices';
import { buildAuditStatement } from '../../../core/audit';
import type { RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { requireHubSomewhere } from '../conversations/conversation-access';
import { buildSaveAlertChoicesStatement, findAlertChoices } from './alert-choices.repo';

const FOR_NEW_OFFICERS = 'communication-hub.alert_types_for_new_officers';

/** 25 C4: the alert types new officers start with; null while the administrator hasn't set them. */
async function startingTypes(db: D1Database): Promise<SwitchableAlertType[] | null> {
  const setting = await getSetting<SwitchableAlertType[]>(db, FOR_NEW_OFFICERS);
  return setting.status === 'configured' ? setting.value : null;
}

/** Brief 20 C2: the officer's alerts — their own choice, or, until they choose, what new officers start with (D-163). */
export async function myAlertChoices(
  db: D1Database,
  ctx: RequestContext,
): Promise<AlertChoicesView> {
  await requireHubSomewhere(db, ctx);
  const chosen = (await findAlertChoices(db, [ctx.personId])).get(ctx.personId);
  return { alertTypes: chosen ?? (await startingTypes(db)), chosen: chosen !== undefined };
}

export async function saveMyAlertChoices(
  db: D1Database,
  ctx: RequestContext,
  alertTypes: SwitchableAlertType[],
): Promise<void> {
  await requireHubSomewhere(db, ctx);
  const unique = [...new Set(alertTypes)];
  await db.batch([
    buildSaveAlertChoicesStatement(db, {
      personId: ctx.personId,
      alertTypes: unique,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'alert-choices.saved',
      entityType: 'person',
      entityId: ctx.personId,
      after: { alertTypes: unique },
    }),
  ]);
}

/**
 * Brief 20 C1, C2 and rules: which of these people receive an alert of this
 * type — national circulars always notify, whatever anyone chose.
 */
export async function peopleReceiving(
  db: D1Database,
  personIds: string[],
  alertType: AlertType,
): Promise<Set<string>> {
  if (ALERT_TYPES_ALWAYS_ON.includes(alertType)) return new Set(personIds);
  const [choices, starting] = await Promise.all([
    findAlertChoices(db, personIds),
    startingTypes(db),
  ]);
  return new Set(
    personIds.filter((id) =>
      (choices.get(id) ?? starting ?? []).includes(alertType as SwitchableAlertType),
    ),
  );
}

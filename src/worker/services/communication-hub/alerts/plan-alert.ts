import { can, getTodayInLondon } from '../../../core/permissions';
import { isServiceEnabled } from '../../../core/service-switches';
import { listUnits } from '../../committee-register';
import type { AlertPlan, HubNotificationKind } from './alert-plan';
import {
  listCurrentOfficersIn,
  listDiscussionMemberIds,
  listInvolvedUnits,
  listRoleHolderIds,
  listVoterIds,
} from './alert-recipients.repo';
import type { HubAlertEvent } from './hub-alert-events';
import { findAlertDetails } from './alert-details.repo';

const READ_NOTICEBOARD = 'communication-hub.noticeboard.read';
const HUB = '/communication-hub';

/** The units among these where the hub is on (8.4): nobody is alerted about a hub they can't open. */
async function hubOn(db: D1Database, unitIds: string[]): Promise<string[]> {
  const on = await Promise.all(unitIds.map((id) => isServiceEnabled(db, 'communication-hub', id)));
  return unitIds.filter((_, i) => on[i]);
}

/** D-154: the unit's officers who read its Noticeboard now. */
async function noticeboardReaders(db: D1Database, unitId: string): Promise<string[]> {
  const officers = await listCurrentOfficersIn(db, [unitId], getTodayInLondon());
  const reads = await Promise.all(
    officers.map((o) =>
      can(
        db,
        { personId: o.personId, units: o.units, roles: [], capabilities: [], isSystemAdmin: false },
        READ_NOTICEBOARD,
        { unitId },
      ),
    ),
  );
  return officers.filter((_, i) => reads[i]).map((o) => o.personId);
}

/** Every officer of these units, where the hub is on (D-157, D-160). */
async function officersOf(db: D1Database, unitIds: string[]): Promise<string[]> {
  return (await listCurrentOfficersIn(db, await hubOn(db, unitIds), getTodayInLondon())).map(
    (o) => o.personId,
  );
}

/** Who takes part in a conversation now (D-158, D-160, D-168). */
async function conversationPeople(
  db: D1Database,
  event: Extract<HubAlertEvent, { kind: 'reply' }>,
): Promise<string[]> {
  if (event.conversation === 'discussion') return listDiscussionMemberIds(db, event.conversationId);
  if (event.conversation === 'request')
    return officersOf(
      db,
      await listInvolvedUnits(db, { requestId: event.conversationId, withAsker: true }),
    );
  const units = await hubOn(
    db,
    (await listUnits(db)).map((unit) => unit.id),
  );
  return listRoleHolderIds(db, {
    roleId: event.conversationId,
    unitIds: units,
    today: getTodayInLondon(),
  });
}

const everyone = (
  ids: string[],
  alertType: AlertPlan['recipients'][number]['alertType'],
  kind: HubNotificationKind,
  except?: string,
) => ids.filter((id) => id !== except).map((personId) => ({ personId, alertType, kind }));

/** D-154, P11: a new notice's readers — its chosen voters alerted to a vote, the others to a notice. */
async function noticeRecipients(
  db: D1Database,
  event: Extract<HubAlertEvent, { kind: 'notice' }>,
): Promise<AlertPlan['recipients']> {
  const voters = await listVoterIds(db, event.noticeId);
  return (await noticeboardReaders(db, event.unitId))
    .filter((id) => id !== event.authorPersonId)
    .map((personId) =>
      voters.includes(personId)
        ? { personId, alertType: 'votes' as const, kind: 'communication-hub.vote' as const }
        : { personId, alertType: 'notices' as const, kind: 'communication-hub.notice' as const },
    );
}

/** Brief 20 C1 and 10.1: who is alerted about the event, of which type and kind. */
async function recipientsOf(
  db: D1Database,
  event: HubAlertEvent,
): Promise<AlertPlan['recipients']> {
  if (event.kind === 'notice') return noticeRecipients(db, event);
  if (event.kind === 'vote-result')
    return everyone(
      await noticeboardReaders(db, event.unitId),
      'votes',
      'communication-hub.vote-result',
    );
  if (event.kind === 'circular') {
    const units = await listInvolvedUnits(db, { circularId: event.circularId });
    return everyone(await officersOf(db, units), 'circulars', 'communication-hub.circular');
  }
  if (event.kind === 'request') {
    const units = await listInvolvedUnits(db, { requestId: event.requestId, withAsker: false });
    const officers = await officersOf(db, units);
    return everyone(officers, 'requests', 'communication-hub.request', event.authorPersonId);
  }
  if (event.kind === 'discussion') {
    // D-169: a new discussion is its own kind, chosen with the replies.
    const members = await listDiscussionMemberIds(db, event.discussionId);
    return everyone(members, 'replies', 'communication-hub.discussion', event.authorPersonId);
  }
  const people = await conversationPeople(db, event);
  return everyone(people, 'replies', 'communication-hub.reply', event.authorPersonId);
}

/** Brief 20 C1 and 10.1: who is alerted about the event, and with what. */
export async function planAlert(db: D1Database, event: HubAlertEvent): Promise<AlertPlan | null> {
  const details = await findAlertDetails(db, event);
  if (!details) return null;
  const { params, unit, section } = details;
  return { recipients: await recipientsOf(db, event), params, unit, url: `${HUB}/${section}` };
}

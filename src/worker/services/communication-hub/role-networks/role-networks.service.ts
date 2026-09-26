import type {
  HubMessage,
  RoleNetwork,
} from '../../../../shared/communication-hub/conversation-records';
import { ForbiddenError } from '../../../core/errors';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { requireHubSomewhere } from '../conversations/conversation-access';
import { buildInsertMessageStatement, listMessages } from '../conversations/hub-messages.repo';
import { listHeldRoles } from './role-networks.repo';

/** Brief 20 B1 and D-158: the officer's role networks — one per role they hold now, where the hub is on. */
export async function myRoleNetworks(db: D1Database, ctx: RequestContext): Promise<RoleNetwork[]> {
  const unitIds = await requireHubSomewhere(db, ctx);
  return listHeldRoles(db, { personId: ctx.personId, unitIds, today: getTodayInLondon() });
}

/** A member of the network: holding its role now, in a unit where the hub is on. */
async function requireMember(db: D1Database, ctx: RequestContext, roleId: string): Promise<void> {
  if (!(await myRoleNetworks(db, ctx)).some((network) => network.roleId === roleId))
    throw new ForbiddenError('permission.denied');
}

/** Brief 20 B1 and D-158: the network's one shared conversation. */
export async function roleNetworkMessages(
  db: D1Database,
  ctx: RequestContext,
  roleId: string,
): Promise<HubMessage[]> {
  await requireMember(db, ctx, roleId);
  return listMessages(db, {
    kind: 'role-network',
    conversationId: roleId,
    personId: ctx.personId,
    today: getTodayInLondon(),
  });
}

export async function postRoleNetworkMessage(
  db: D1Database,
  ctx: RequestContext,
  params: { roleId: string; body: string },
): Promise<void> {
  await requireMember(db, ctx, params.roleId);
  await db.batch([
    buildInsertMessageStatement(db, {
      kind: 'role-network',
      conversationId: params.roleId,
      authorPersonId: ctx.personId,
      body: params.body,
      at: new Date().toISOString(),
    }),
  ]);
}

import type {
  CircularBranch,
  OpenedCircular,
  ReceivedCircular,
  SentCircular,
} from '../../../../shared/communication-hub/circular-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { requireHubCapability, requireHubOfficer, type HubUnitRow } from '../hub-access';
import {
  buildRecordOpeningStatement,
  buildSendCircularStatements,
  findReceivedCircular,
  listReceivedCirculars,
} from './circulars.repo';
import type { CircularInput } from './circulars.schema';
import { listSentCircularRows } from './sent-circulars.repo';

export const SEND = 'communication-hub.circulars.send';

/** Brief 20 A3: the General Council's own unit; nobody else sends circulars (a trigger also refuses). */
function requireGeneralCouncil(unit: HubUnitRow): void {
  if (unit.type !== 'national') throw new ConflictError('communication-hub.general-council-only');
}

/** The branches a circular can go to. */
async function listBranches(db: D1Database): Promise<CircularBranch[]> {
  return (await listUnits(db))
    .filter((unit) => unit.type === 'branch')
    .map((unit) => ({ id: unit.id, nameEn: unit.nameEn, nameAr: unit.nameAr }));
}

/** Brief 20 A3 and D-157: send a circular to every branch there is now, or to the chosen ones; never changed after. */
export async function sendCircular(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: CircularInput,
): Promise<{ id: string }> {
  requireGeneralCouncil(await requireHubCapability(db, ctx, SEND, unitId));
  const branches = (await listBranches(db)).map((branch) => branch.id);
  const recipientIds = input.toAllBranches ? branches : [...new Set(input.unitIds)];
  if (!recipientIds.every((id) => branches.includes(id)))
    throw new ConflictError('communication-hub.branch-not-found');
  if (recipientIds.length === 0) throw new ConflictError('communication-hub.no-branches');
  const id = generateId();
  await db.batch([
    ...buildSendCircularStatements(db, {
      id,
      unitId,
      title: input.title,
      body: input.body,
      toAllBranches: input.toAllBranches,
      recipientIds,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'circular.sent',
      entityType: 'circular',
      entityId: id,
      after: { ...input, recipientIds },
    }),
  ]);
  return { id };
}

/** The branches a circular can be sent to, for those who send them. */
export async function circularBranches(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<CircularBranch[]> {
  requireGeneralCouncil(await requireHubCapability(db, ctx, SEND, unitId));
  return listBranches(db);
}

/** Brief 20 A3 and D-157: the circulars the branch received, for every officer of it. */
export async function receivedCirculars(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<ReceivedCircular[]> {
  await requireHubOfficer(db, ctx, unitId);
  return listReceivedCirculars(db, unitId);
}

/** Brief 20 A3, A4 and P14: open a circular the branch received — its first opening is recorded, once. */
export async function openCircular(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; circularId: string },
): Promise<OpenedCircular> {
  await requireHubOfficer(db, ctx, params.unitId);
  const circular = await findReceivedCircular(db, params);
  if (!circular) throw new NotFoundError('communication-hub.circular-not-found');
  if (circular.openedAt !== null) return circular;
  const at = new Date().toISOString();
  await db.batch([buildRecordOpeningStatement(db, { ...params, personId: ctx.personId, at })]);
  return (await findReceivedCircular(db, params)) ?? circular;
}

/** Brief 20 A4 and D-157: what the General Council sent, and which branches have opened each, for its officers. */
export async function sentCirculars(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<SentCircular[]> {
  requireGeneralCouncil(await requireHubOfficer(db, ctx, unitId));
  const { sent, recipients } = await listSentCircularRows(db, unitId);
  return sent.map((row) => ({
    ...row,
    toAllBranches: Boolean(row.toAllBranches),
    recipients: recipients
      .filter((r) => r.circularId === row.id)
      .map(({ unitId: id, nameEn, nameAr, openedAt }) => ({
        unitId: id,
        nameEn,
        nameAr,
        openedAt,
      })),
  }));
}

import type { ResourceRecord } from '../../../../shared/resources-library/resource';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireLibraryCapability, requireWritable } from '../library-access';
import { runLibraryBatch } from '../library-versioning';
import { libraryView } from '../library-view';
import {
  buildUpdateResourceStatement,
  findResource,
  listResourcesOf,
  type ResourceRow,
} from './templates-and-guides.repo';
import type { ResourceDetails } from './templates-and-guides.schema';

export const MANAGE = 'resources-library.resources.manage';

/** Brief 16 A1 to A3: the unit's templates and guides, and the General Council's. */
export async function listResources(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<ResourceRecord[]> {
  const view = await libraryView(db, ctx, unitId, MANAGE);
  return (await listResourcesOf(db, view.unitIds)).filter(view.shows).map((r) => ({
    id: r.id,
    unitId: r.unitId,
    national: view.isNational(r.unitId),
    kind: r.kind,
    title: r.title,
    description: r.description,
    language: r.language,
    fileName: r.fileName,
    retiredAt: r.retiredAt,
    version: r.version,
  }));
}

/** A template or guide of this unit, which the officer manages there (P4). */
export async function requireManagedResource(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; resourceId: string },
): Promise<{ resource: ResourceRow; unit: Awaited<ReturnType<typeof requireLibraryCapability>> }> {
  const unit = await requireLibraryCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const resource = await findResource(db, params.resourceId);
  if (resource?.unitId !== params.unitId)
    throw new NotFoundError('resources-library.resource-not-found');
  return { resource, unit };
}

/** D-103: change a template's or guide's details, from the version read (9.1). */
export async function changeResourceDetails(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; resourceId: string; version: number; details: ResourceDetails },
): Promise<void> {
  const { resource } = await requireManagedResource(db, ctx, params);
  await runLibraryBatch(db, [
    buildUpdateResourceStatement(db, {
      id: resource.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      details: params.details,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'resource.changed',
      entityType: 'resource',
      entityId: resource.id,
      before: resource,
      after: params.details,
    }),
  ]);
}

import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import type { UploadTarget } from '../../../core/files';
import { can, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';

const UPLOAD = 'documents-archive.documents.upload';

/**
 * Where an upload goes: a unit this officer may upload to, which is the
 * General Council or an active branch (P4: an inactive branch is read-only).
 */
export async function uploadTarget(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  documentId: string,
): Promise<UploadTarget> {
  if (!(await can(db, ctx, UPLOAD, { unitId }))) throw new ForbiddenError('permission.denied');
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (unit.type === 'branch' && unit.status !== 'active') {
    throw new ConflictError('branches.inactive');
  }
  return {
    unitId,
    unitCode: unit.code,
    service: 'documents-archive',
    recordId: documentId,
    use: 'documents',
  };
}

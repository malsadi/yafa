import { ConflictError, ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';

const CAPABILITY = 'administration-panel.permissions-matrix.manage';

export async function requireMatrixCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

export function requireCurrentVersion(current: number, expected: number): void {
  if (current !== expected) {
    throw new ConflictError('permissions-matrix.changed');
  }
}

/**
 * Runs one change as a single batch. If another change landed first, the
 * database refuses the version number (migration 0013) and nothing of this
 * change is written; that refusal becomes a clear 409.
 */
export async function runMatrixBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/UNIQUE|next in sequence/.test(message)) {
      throw new ConflictError('permissions-matrix.changed');
    }
    throw error;
  }
}

import type { AdminText, AdminTextKey } from '../../../../shared/administration-panel/admin-texts';
import { NotFoundError } from '../../../core/errors';
import { findAdminText } from './admin-texts.repo';

/** A text officers read, or 404 until the administrator writes it (rule 5). */
export async function readOfficerText(db: D1Database, key: AdminTextKey): Promise<AdminText> {
  const text = await findAdminText(db, key);
  if (!text) throw new NotFoundError('texts.not-written');
  return text;
}

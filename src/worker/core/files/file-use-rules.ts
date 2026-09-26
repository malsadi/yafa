import { fileUseSettingKeys, type FileUse } from '../../../shared/core/file-uses';
import { ConflictError, ServiceUnavailableError } from '../errors';
import { getSetting } from '../settings';

const BYTES_PER_MB = 1024 * 1024;

/**
 * Brief 9.3: a file may be stored for a use only if its type is one the
 * administrator allows for that use and it is within the use's size limit.
 * Until both are set, uploads for that use wait (rule 5).
 */
export async function requireAllowedFile(
  db: D1Database,
  params: { use: FileUse; contentType: string; size: number },
): Promise<void> {
  const keys = fileUseSettingKeys(params.use);
  const [types, limitMb] = await Promise.all([
    getSetting<string[]>(db, keys.types),
    getSetting<number>(db, keys.sizeLimitMb),
  ]);
  if (types.status === 'not-configured' || limitMb.status === 'not-configured') {
    throw new ServiceUnavailableError('setting.not-configured');
  }
  if (!types.value.includes(params.contentType)) throw new ConflictError('files.type-not-allowed');
  if (params.size > limitMb.value * BYTES_PER_MB) throw new ConflictError('files.too-large');
}

/** A whole-number setting in the unit it is kept in, or a refusal while not set (rule 5). */
export async function requireNumberSetting(db: D1Database, key: string): Promise<number> {
  const setting = await getSetting<number>(db, key);
  if (setting.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  return setting.value;
}

export { BYTES_PER_MB };

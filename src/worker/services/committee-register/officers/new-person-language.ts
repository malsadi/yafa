import type { Language } from '../../../../shared/core/languages';
import { ServiceUnavailableError } from '../../../core/errors';
import { getSetting } from '../../../core/settings';

/**
 * The language a new person starts in (brief 8.5): the administrator's
 * setting. Until it is set, creating a person waits (rule 5).
 */
export async function newPersonLanguage(db: D1Database): Promise<Language> {
  const setting = await getSetting<Language>(db, 'administration-panel.new_officer_language');
  if (setting.status === 'not-configured') {
    throw new ServiceUnavailableError('setting.not-configured');
  }
  return setting.value;
}

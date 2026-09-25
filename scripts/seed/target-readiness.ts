import { NATIONAL_SCOPE } from '../../src/shared/core/national-scope.ts';
import { queryTarget, type SeedTarget } from './seed-target.ts';

const LANGUAGE_SETTING = 'administration-panel.new_officer_language';

/**
 * What the target must already be before the seed loads: an empty register
 * (the seed is the first data, never loaded twice), and the language new
 * officers start with set by the data administrator (brief 8.5, rule 5).
 */
export function checkTarget(target: SeedTarget, errors: string[]): { language: string } {
  const [units] = queryTarget<{ n: number }>(target, 'SELECT COUNT(*) AS n FROM units');
  if ((units?.n ?? 0) > 0)
    errors.push(
      `The ${target} database already holds units; the seed loads only into an empty register.`,
    );
  const [setting] = queryTarget<{ value: string }>(
    target,
    `SELECT value FROM settings WHERE key = '${LANGUAGE_SETTING}' AND scope = '${NATIONAL_SCOPE}'`,
  );
  if (!setting) {
    errors.push(
      `"Language new officers start with" is not set on the ${target} database, so people cannot be added yet (rule 5, O-030).`,
    );
    return { language: '' };
  }
  return { language: JSON.parse(setting.value) as string };
}

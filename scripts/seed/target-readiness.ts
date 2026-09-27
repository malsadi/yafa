import { queryTarget, type SeedTarget } from './seed-target.ts';

/**
 * What the target must already be before the seed loads: an empty register
 * (the seed is the first data, never loaded twice). The language the seeded
 * people start with comes from the command line instead of a setting (D-212).
 */
export function checkTarget(target: SeedTarget, errors: string[]): void {
  const [units] = queryTarget<{ n: number }>(target, 'SELECT COUNT(*) AS n FROM units');
  if ((units?.n ?? 0) > 0)
    errors.push(
      `The ${target} database already holds units; the seed loads only into an empty register.`,
    );
}

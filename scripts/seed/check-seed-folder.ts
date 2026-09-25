import { checkSeed } from './check-seed.ts';
import { readSeedFiles } from './read-seed-files.ts';
import type { SeedPlanInput } from './seed-plan-input.ts';
import { todayInLondon } from './seed-dates.ts';

/**
 * Reads and checks the seed folder. A missing file is reported on its own,
 * so its absence isn't buried under the checks it would fail.
 */
export function checkSeedFolder(folder: string): { input: SeedPlanInput | null; errors: string[] } {
  const missing: string[] = [];
  const texts = readSeedFiles(folder, missing);
  if (missing.length > 0) return { input: null, errors: missing };
  return checkSeed(texts, todayInLondon());
}

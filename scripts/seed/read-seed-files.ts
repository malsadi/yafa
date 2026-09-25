import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The five files docs/seed-files.md lists, by their names in `seed/`. */
export const SEED_FILES = {
  units: 'units.csv',
  roles: 'roles.csv',
  people: 'people.csv',
  noticeEn: 'privacy-notice-en.txt',
  noticeAr: 'privacy-notice-ar.txt',
} as const;

export type SeedTexts = Record<keyof typeof SEED_FILES, string>;

/** Reads every seed file as UTF-8; a missing one is listed in `errors` and read as empty. */
export function readSeedFiles(folder: string, errors: string[]): SeedTexts {
  const read = (name: string) => {
    const path = join(folder, name);
    if (!existsSync(path)) {
      errors.push(`seed/${name} is missing.`);
      return '';
    }
    return readFileSync(path, 'utf8');
  };
  return {
    units: read(SEED_FILES.units),
    roles: read(SEED_FILES.roles),
    people: read(SEED_FILES.people),
    noticeEn: read(SEED_FILES.noticeEn),
    noticeAr: read(SEED_FILES.noticeAr),
  };
}

import { checkLaunchPeople } from './check-launch-people.ts';
import { checkPeople, PEOPLE_COLUMNS } from './check-people.ts';
import { checkRoles, ROLE_COLUMNS } from './check-roles.ts';
import { checkUnits, UNIT_COLUMNS } from './check-units.ts';
import type { SeedTexts } from './read-seed-files.ts';
import type { SeedPlanInput } from './seed-plan-input.ts';
import { readSeedTable } from './seed-table.ts';

/**
 * Every check in docs/seed-files.md, over all five files at once, so the
 * owner sees every problem together. Loading may go ahead only when
 * `errors` is empty ("Nothing is loaded until all five files pass every check").
 */
export function checkSeed(
  texts: SeedTexts,
  today: string,
): { input: SeedPlanInput; errors: string[] } {
  const errors: string[] = [];
  const units = checkUnits(readSeedTable('units.csv', texts.units, UNIT_COLUMNS, errors), errors);
  const roles = checkRoles(readSeedTable('roles.csv', texts.roles, ROLE_COLUMNS, errors), errors);
  const people = readSeedTable('people.csv', texts.people, PEOPLE_COLUMNS, errors);
  const terms = checkPeople(people, { units, roles }, errors);
  if (texts.noticeEn.trim() === '') errors.push('privacy-notice-en.txt must not be empty (D-051).');
  if (texts.noticeAr.trim() === '') errors.push('privacy-notice-ar.txt must not be empty (D-051).');
  const input = { units, roles, terms, notice: { en: texts.noticeEn, ar: texts.noticeAr } };
  checkLaunchPeople(input, today, errors);
  return { input, errors };
}

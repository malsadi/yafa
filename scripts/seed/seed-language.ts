import { LANGUAGES, type Language } from '../../src/shared/core/languages.ts';

/**
 * D-212: the language the seeded people start with, given on the command
 * line (`--language en` or `--language ar`). It is not the "Language new
 * officers start with" setting: that stays unset until the data
 * administrator sets it on the set-up checklist (D-074), which nobody can
 * reach before the seed is loaded.
 */
export function readSeedLanguage(args: string[], errors: string[]): Language | null {
  const value = args.includes('--language') ? args[args.indexOf('--language') + 1] : undefined;
  if (value !== undefined && (LANGUAGES as readonly string[]).includes(value))
    return value as Language;
  errors.push(
    `Choose the language the seeded people start with: ${LANGUAGES.map((l) => `--language ${l}`).join(' or ')}.`,
  );
  return null;
}

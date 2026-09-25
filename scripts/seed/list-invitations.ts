import { checkSeedFolder } from './check-seed-folder.ts';

/**
 * D-062: lists exactly who would be invited once the seed is loaded — each
 * person in seed/people.csv, by name and email — and sends nothing.
 *   node scripts/seed/list-invitations.ts
 */
function main(): number {
  const { input, errors } = checkSeedFolder('seed');
  if (!input || errors.length > 0) {
    console.error(
      ['The seed files do not pass their checks:', ...errors.map((e) => `- ${e}`)].join('\n'),
    );
    return 1;
  }
  const people = [...new Map(input.terms.map((t) => [t.email, t.name])).entries()];
  console.log(
    [
      `${String(people.length)} people would be invited to sign in:`,
      ...people.map(([email, name]) => `- ${name} <${email}>`),
      'Nothing was sent.',
    ].join('\n'),
  );
  return 0;
}

process.exitCode = main();

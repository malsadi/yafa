import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateId } from '../../src/worker/core/ids/generate-id.ts';
import { buildSeedSql } from './build-seed-sql.ts';
import { checkSeedFolder } from './check-seed-folder.ts';
import { isSeedTarget, runFileOnTarget } from './seed-target.ts';
import { checkTarget } from './target-readiness.ts';

/**
 * Loads the owner's seed files (brief 26 Phase 1, docs/seed-files.md):
 *   node scripts/seed/load-seed.ts --target local|preview [--apply]
 * Without --apply it only checks and shows what it would load. It never
 * invites anyone (D-062): `npm run seed:invitations` lists who would be.
 */
function main(args: string[]): number {
  const target = args[args.indexOf('--target') + 1];
  if (!args.includes('--target') || !isSeedTarget(target)) {
    console.error('Choose where to load: --target local or --target preview.');
    return 1;
  }
  const { input, errors } = checkSeedFolder('seed');
  const { language } =
    input && errors.length === 0 ? checkTarget(target, errors) : { language: '' };
  if (!input || errors.length > 0) {
    console.error(['Nothing was loaded:', ...errors.map((e) => `- ${e}`)].join('\n'));
    return 1;
  }
  const people = new Set(input.terms.map((t) => t.email)).size;
  console.log(
    `Checked: ${String(input.units.length)} units, ${String(input.roles.length)} standard roles, ${String(people)} people with ${String(input.terms.length)} terms, and the privacy notice in both languages. No invitation is sent.`,
  );
  if (!args.includes('--apply')) {
    console.log(`Nothing was written. Run again with --apply to load into the ${target} database.`);
    return 0;
  }
  const statements = buildSeedSql(input, {
    language,
    now: new Date().toISOString(),
    newId: generateId,
  });
  const file = join(tmpdir(), `yafa-seed-${String(Date.now())}.sql`);
  writeFileSync(file, statements.join('\n'));
  runFileOnTarget(target, file);
  console.log(
    `Loaded into the ${target} database. To see who would be invited: npm run seed:invitations`,
  );
  return 0;
}

process.exitCode = main(process.argv.slice(2));

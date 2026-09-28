import { execFileSync } from 'node:child_process';

/**
 * Where the seed loads: the local development database, the preview
 * database, or production. D-220: production only when the owner runs the
 * loader and types the database's name to confirm; Claude Code never loads
 * it (CLAUDE.md "Never").
 */
export const SEED_TARGETS = {
  local: { database: 'yafa-portal-local-db', flags: ['--local'] },
  preview: { database: 'yafa-portal-preview-db', flags: ['--remote', '--env', 'preview'] },
  production: {
    database: 'yafa-portal-production-db',
    flags: ['--remote', '--env', 'production'],
  },
} as const;

export type SeedTarget = keyof typeof SEED_TARGETS;

export function isSeedTarget(value: string | undefined): value is SeedTarget {
  return value === 'local' || value === 'preview' || value === 'production';
}

function wrangler(target: SeedTarget, args: string[]): string {
  const { database, flags } = SEED_TARGETS[target];
  return execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', database, ...flags, '--config', 'wrangler.jsonc', ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
}

/** Runs one read-only query on the target and returns its rows. */
export function queryTarget<Row>(target: SeedTarget, query: string): Row[] {
  const output = JSON.parse(wrangler(target, ['--json', '--command', query])) as {
    results: Row[];
  }[];
  return output[0]?.results ?? [];
}

/** Runs a file of SQL statements on the target. */
export function runFileOnTarget(target: SeedTarget, file: string): void {
  wrangler(target, ['--file', file, '--yes']);
}

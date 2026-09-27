import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { branchSql, closingVoteSql, settingsSql, switchesSql } from './e2e-services.ts';
import { grantsSql, linkSql, peopleSql } from './e2e-world.ts';

// T-149: the browser tests' database, made afresh before each run — its own
// local state, never the owner's (.wrangler/state), never a remote database.
export const E2E_STATE_DIR = '.wrangler/e2e-state';
const DATABASE = 'yafa-portal-e2e-db';
const SEED_FILE = path.join(E2E_STATE_DIR, 'e2e-seed.sql');
// Long enough for the dev server to start and the officers to sign in first.
const VOTE_CLOSES_IN_SECONDS = 180;

function wrangler(args: string[]): void {
  execFileSync(
    'npx',
    ['wrangler', 'd1', ...args, DATABASE, '--local', '--env', 'e2e', '--persist-to', E2E_STATE_DIR],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
}

const now = new Date();
const at = now.toISOString();
const newId = () => randomUUID();
rmSync(E2E_STATE_DIR, { recursive: true, force: true });
mkdirSync(E2E_STATE_DIR, { recursive: true });
wrangler(['migrations', 'apply']);
const statements = [
  ...peopleSql(newId, at),
  ...linkSql(newId, at),
  ...grantsSql(newId, at),
  ...settingsSql(newId, at),
  ...switchesSql(at),
  ...branchSql(newId, at),
  ...closingVoteSql(newId, now, VOTE_CLOSES_IN_SECONDS),
];
writeFileSync(SEED_FILE, `${statements.join('\n')}\n`);
execFileSync(
  'npx',
  [
    'wrangler',
    'd1',
    'execute',
    DATABASE,
    '--local',
    '--env',
    'e2e',
    '--persist-to',
    E2E_STATE_DIR,
    '--file',
    SEED_FILE,
    '--yes',
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);
console.log(`Browser test database ready in ${E2E_STATE_DIR}.`);

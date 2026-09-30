import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { q, roleName } from '../../scripts/e2e/e2e-world';
import { RoleDesignation } from '../../src/shared/committee-register/role-designation';
import { everyGrant } from './sweep-grants';

// D-226: the sweep's test administrator holds every capability, and the
// national register officer's designation for the fixed ones (brief 7.3).
// Only the browser tests' own local database, made afresh for this run.
const STATE_DIR = '.wrangler/e2e-state';
const DATABASE = 'yafa-portal-e2e-db';

test('the sweep administrator holds every capability', () => {
  const role = `(SELECT id FROM roles WHERE name_en = ${q(roleName('administrator'))})`;
  const now = new Date().toISOString();
  const statements = [
    `DELETE FROM permission_grants WHERE role_id = ${role};`,
    `UPDATE roles SET designation = ${q(RoleDesignation.NationalRegisterOfficer)} WHERE id = ${role};`,
    ...everyGrant().map(
      (grant) =>
        `INSERT INTO permission_grants (id, role_id, capability, scope, created_at) VALUES (${q(randomUUID())}, ${role}, ${q(grant.capability)}, ${q(grant.scope)}, ${q(now)});`,
    ),
  ];
  const file = path.join(STATE_DIR, 'sweep-grants.sql');
  writeFileSync(file, `${statements.join('\n')}\n`);
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
      STATE_DIR,
      '--file',
      file,
      '--yes',
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
});

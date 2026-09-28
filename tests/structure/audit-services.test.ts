import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUDIT_ACTION_SERVICES } from '../../src/shared/administration-panel/audit-services';
import { listSourceFiles } from './list-source-files';

const ROOT = path.join(import.meta.dirname, '../..');

/** Every action prefix the Worker records: the name before the first dot, in an `action:` value. */
function recordedPrefixes(): string[] {
  const prefixes = new Set<string>();
  for (const file of listSourceFiles(path.join(ROOT, 'src/worker'))) {
    for (const line of readFileSync(file, 'utf8').matchAll(/action:\s*([^\n]+)/g))
      for (const m of (line[1] ?? '').matchAll(/['`]([a-z-]+)\./g)) prefixes.add(m[1] ?? '');
  }
  for (const line of readFileSync(
    path.join(ROOT, 'src/worker/services/committee-register/accounts/accounts.service.ts'),
    'utf8',
  ).matchAll(/audit\(db, params, '([a-z-]+)\./g))
    prefixes.add(line[1] ?? '');
  return [...prefixes].sort();
}

describe('the audit log knows every action’s service (brief 25 D2; D-217)', () => {
  it('has each recorded action prefix in its service table', () => {
    expect(recordedPrefixes().filter((p) => !(p in AUDIT_ACTION_SERVICES))).toEqual([]);
  });
});

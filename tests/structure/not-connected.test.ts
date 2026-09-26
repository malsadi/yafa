import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { listSourceFiles } from './list-source-files';

const ROOT = path.join(import.meta.dirname, '../..');
const SERVICES = path.join(ROOT, 'src/worker/services');

/** Every file a folder's source files import, resolved to its path in the repository. */
function resolvedImportsOf(folder: string): string[] {
  return listSourceFiles(path.join(ROOT, folder)).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/from '(\.[^']+)'/g)].map((m) =>
      path.relative(ROOT, path.resolve(path.dirname(file), m[1] ?? '')),
    ),
  );
}

/** The services a folder reaches into, other than its own. */
function otherServicesReached(folder: string, own: string): string[] {
  const services = resolvedImportsOf(folder)
    .filter((p) => p.startsWith(path.relative(ROOT, SERVICES)))
    .map((p) => p.split(path.sep)[3] ?? '')
    .filter((service) => service !== own);
  return [...new Set(services)];
}

// Brief 10.2: what must NOT be connected — each has a test.
describe('services that must not be connected (brief 10.2)', () => {
  it('keeps the Task tracker away from the Communication hub, and its reminders off push', () => {
    const reached = [
      ...resolvedImportsOf('src/worker/services/task-tracker'),
      ...resolvedImportsOf('src/worker/cron'),
    ];
    expect(
      reached.filter(
        (p) => p.includes('communication-hub') || p.includes(path.join('core', 'push')),
      ),
    ).toEqual([]);
    expect(otherServicesReached('src/worker/services/task-tracker', 'task-tracker')).toEqual([
      'committee-register',
    ]);
  });

  it('gives equipment loans no link to any other service — only the shared lists and the register’s units', () => {
    expect(
      otherServicesReached('src/worker/services/resources-library/equipment', 'resources-library'),
    ).toEqual(['administration-panel']);
  });
});

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { listSourceFiles } from './list-source-files';

const ROOT = path.join(import.meta.dirname, '../..');
const SERVICES = path.join(ROOT, 'src/worker/services');

/** Every file these source files import, resolved to its path in the repository. */
function importsOfFiles(files: string[]): string[] {
  return files.flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/from '(\.[^']+)'/g)].map((m) =>
      path.relative(ROOT, path.resolve(path.dirname(file), m[1] ?? '')),
    ),
  );
}

/** Every file a folder's source files import, resolved to its path in the repository. */
function resolvedImportsOf(folder: string): string[] {
  return importsOfFiles(listSourceFiles(path.join(ROOT, folder)));
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
      // Its own scheduled job — the cron folder also holds the hub's own jobs.
      ...importsOfFiles([path.join(ROOT, 'src/worker/cron/task-reminders.ts')]),
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

  it('keeps the Calendar away from the Communication hub', () => {
    const reached = resolvedImportsOf('src/worker/services/calendar');
    expect(reached.filter((p) => p.includes('communication-hub'))).toEqual([]);
  });

  it('lets only the Event organiser and the Meeting recorder make automatic Noticeboard posts', () => {
    const callers = listSourceFiles(path.join(ROOT, 'src'))
      .filter((file) => readFileSync(file, 'utf8').includes('postAutomatic'))
      .map((file) => path.relative(SERVICES, file).split(path.sep)[0] ?? '');
    expect(
      [...new Set(callers)].filter(
        (service) =>
          !['communication-hub', 'event-organiser', 'meeting-recorder'].includes(service),
      ),
    ).toEqual([]);
  });

  it('gives equipment loans no link to any other service — only the shared lists and the register’s units', () => {
    expect(
      otherServicesReached('src/worker/services/resources-library/equipment', 'resources-library'),
    ).toEqual(['administration-panel']);
  });
});

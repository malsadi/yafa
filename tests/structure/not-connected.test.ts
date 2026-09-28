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

  it('keeps Correspondence away from the Communication hub (brief 10.2, 23 rules)', () => {
    const own = 'correspondence-and-letters';
    const folder = `src/worker/services/${own}`;
    expect(resolvedImportsOf(folder).filter((p) => p.includes('communication-hub'))).toEqual([]);
    expect(otherServicesReached(folder, own).sort()).toEqual([
      'administration-panel',
      'committee-register',
      'resources-library',
    ]);
  });

  it('keeps Achievements and reports away from the Communication hub; its links are for the annual report (24 rules)', () => {
    const own = 'achievements-and-reports';
    const folder = `src/worker/services/${own}`;
    expect(resolvedImportsOf(folder).filter((p) => p.includes('communication-hub'))).toEqual([]);
    expect(otherServicesReached(folder, own).sort()).toEqual([
      'administration-panel',
      'committee-register',
      'documents-archive',
      'event-organiser',
      'meeting-recorder',
      'treasury',
    ]);
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

  it('limits the Meeting recorder to its two hub messages, sent only at A1 and C1, and sends nothing to the Task tracker', () => {
    const folder = 'src/worker/services/meeting-recorder';
    const files = listSourceFiles(path.join(ROOT, folder));
    const text = (file: string) => readFileSync(file, 'utf8');
    // The two messages, by kind, and nothing else posts: only the targets file calls postAutomatic.
    const posting = files.filter((file) => text(file).includes('postAutomatic('));
    expect(posting.map((file) => path.basename(file))).toEqual(['meeting-targets.ts']);
    expect(text(posting[0] ?? '')).toContain(
      "export type HubMessage = 'meeting-scheduled' | 'meeting-held';",
    );
    // A1 (scheduling), C1 (logging), and D-209's later sending of those same two.
    const sending = files
      .filter((file) => text(file).includes('hubMessageStatements(db'))
      .map((file) => path.basename(file))
      .sort();
    expect(sending).toEqual([
      'log-report.service.ts',
      'meetings.service.ts',
      'send-later.service.ts',
    ]);
    expect(resolvedImportsOf(folder).filter((p) => p.includes('task-tracker'))).toEqual([]);
  });

  it('keeps Noticeboard votes separate from formal meeting votes', () => {
    const meetings = listSourceFiles(path.join(ROOT, 'src/worker/services/meeting-recorder'));
    expect(
      meetings.filter((file) =>
        /notice_votes|notice_ballots|notice-votes/.test(readFileSync(file, 'utf8')),
      ),
    ).toEqual([]);
    expect(
      resolvedImportsOf('src/worker/services/communication-hub').filter((p) =>
        p.includes('meeting-recorder'),
      ),
    ).toEqual([]);
  });
});

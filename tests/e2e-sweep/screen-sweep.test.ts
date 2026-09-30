import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { languageOf } from '../e2e/e2e-session';
import { linkedScreens, openScreen, screenOf, settle } from './crawl-links';
import { checkScreen, isFailure, listenForProblems, type ScreenProblem } from './screen-problems';

// D-226: every screen the administrator can reach, found by following the
// portal's own links from the home page and the Administration panel, in
// each language and screen size. Nothing is clicked but links; nothing is saved.
const STARTS = ['/', '/admin'];
const MAX_SCREENS = 300;

test('every screen loads without errors', async ({ page }, info) => {
  test.setTimeout(60 * 60_000);
  const language = languageOf(info);
  const found: ScreenProblem[] = [];
  let current = '';
  listenForProblems(page, () => current, found);
  const queue = [...STARTS];
  const seen = new Set(queue.map(screenOf));
  const visited: string[] = [];
  while (queue.length > 0 && visited.length < MAX_SCREENS) {
    const address = queue.shift() ?? '';
    current = screenOf(address);
    visited.push(current);
    console.log(`sweep ${info.project.name} ${String(visited.length)} ${current}`);
    await openScreen(page, address);
    await settle(page, language);
    found.push(...(await checkScreen(page, current, language)));
    for (const next of await linkedScreens(page)) {
      if (!seen.has(screenOf(next))) {
        seen.add(screenOf(next));
        queue.push(next);
      }
    }
  }
  const report = { project: info.project.name, visited, problems: found };
  writeFileSync(info.outputPath('sweep.json'), JSON.stringify(report, null, 2));
  writeFileSync(`test-results/sweep-${info.project.name}.json`, JSON.stringify(report, null, 2));
  // A crawl that found no screen beyond where it started proves nothing.
  expect(visited.length, 'screens reached through links').toBeGreaterThan(STARTS.length);
  const failures = found.filter(isFailure);
  expect(
    failures,
    `${String(failures.length)} problems on ${String(visited.length)} screens`,
  ).toEqual([]);
});

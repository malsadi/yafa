import type { Page } from '@playwright/test';
import type { Language } from '../e2e/e2e-session';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

export interface ScreenProblem {
  screen: string;
  kind: string;
  detail: string;
}

// The browser's own line for a call answered 4xx, which the response listener reports.
const REFUSED_CALL = /status of 4\d\d/;

/**
 * A refused call (4xx) is often by design — a private list (D-221), a text
 * not yet written (rule 5) — and the screen says so in words; it is noted in
 * the report, and only fails the sweep if the screen shows the general error.
 */
export const isFailure = (problem: ScreenProblem) => !problem.kind.startsWith('refused');

// Placeholders and very short words match data too easily to count.
const MIN_LEAK_LENGTH = 12;

function pairs(en: unknown, ar: unknown, out: [string, string][]): [string, string][] {
  if (typeof en === 'string' && typeof ar === 'string') out.push([en, ar]);
  else if (en && ar && typeof en === 'object' && typeof ar === 'object') {
    for (const key of Object.keys(en)) {
      pairs((en as Record<string, unknown>)[key], (ar as Record<string, unknown>)[key], out);
    }
  }
  return out;
}

/** English interface texts whose Arabic differs, to find English left on an Arabic screen. */
const ENGLISH_ONLY = pairs(englishText, arabicText, [])
  .filter(([en, ar]) => en !== ar && en.length >= MIN_LEAK_LENGTH && !en.includes('{'))
  .map(([en]) => en);

/** Listens on the page for errors and refused calls while the screen loads. */
export function listenForProblems(page: Page, current: () => string, found: ScreenProblem[]) {
  page.on('pageerror', (error) => {
    found.push({ screen: current(), kind: 'script error', detail: error.message });
  });
  page.on('console', (message) => {
    // A refused or missing call is reported once, below, from the response itself.
    if (message.type() === 'error' && !REFUSED_CALL.test(message.text())) {
      found.push({ screen: current(), kind: 'console error', detail: message.text() });
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/api/') && response.status() >= 400) {
      found.push({
        screen: current(),
        kind: `${response.status() >= 500 ? 'server failure' : 'refused'} ${String(response.status())}`,
        detail: `${response.request().method()} ${url.pathname}`,
      });
    }
  });
}

/** What the loaded screen itself shows wrong: a general error, a missing page, English in Arabic, sideways scrolling. */
export async function checkScreen(
  page: Page,
  screen: string,
  language: Language,
): Promise<ScreenProblem[]> {
  const words = language === 'ar' ? arabicText : englishText;
  const body = await page.locator('body').innerText();
  const problems: ScreenProblem[] = [];
  const add = (kind: string, detail: string) => problems.push({ screen, kind, detail });
  if (body.includes(words.portalShell.somethingWentWrong)) add('general error shown', '');
  if (body.includes(words.portalShell.pageNotFound)) add('page not found', '');
  if (body.includes(words.portalShell.loading)) add('still loading', '');
  if (language === 'ar') {
    for (const english of ENGLISH_ONLY.filter((text) => body.includes(text)).slice(0, 3)) {
      add('English on an Arabic screen', english);
    }
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (overflow > 1) add('scrolls sideways', `${String(overflow)}px wider than the screen`);
  return problems;
}

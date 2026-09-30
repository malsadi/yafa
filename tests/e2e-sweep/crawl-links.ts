import type { Page } from '@playwright/test';
import { textsFor, type Language } from '../e2e/e2e-session';

// Enough for the dev server to build a screen the first time it is opened.
const SETTLE_MS = 15_000;
const REDRAW_MS = 750;

// A record's id in an address: a ULID or a UUID.
const RECORD_ID =
  /^([0-9A-HJKMNP-TV-Z]{26}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
// Files and the API are not screens.
const NOT_A_SCREEN = /^\/api\/|\.[a-z0-9]{2,5}$/i;

/** The screen an address shows, with record ids made alike, so one record of each kind is visited. */
export const screenOf = (address: string) =>
  address
    .split('/')
    .map((segment) => (RECORD_ID.test(segment) ? ':id' : segment))
    .join('/');

/** Every portal screen the page links to: its own addresses, without query or fragment. */
export async function linkedScreens(page: Page): Promise<string[]> {
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  return hrefs
    .filter((href) => href.startsWith('/'))
    .map((href) => href.split(/[?#]/)[0] ?? '')
    .filter((address) => address !== '' && !NOT_A_SCREEN.test(address));
}

/**
 * Opens a screen the way a link does, inside the loaded app, so each screen
 * does not reload the whole portal; a start page, or a first visit, loads in full.
 */
export async function openScreen(page: Page, address: string): Promise<void> {
  if (!page.url().startsWith('http')) {
    await page.goto(address);
    return;
  }
  await page.evaluate((to) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, address);
}

/**
 * Waits until the screen has drawn: the portal's top bar is there and no
 * "Loading…" is left. The network itself is never quiet for long — the
 * portal polls the inbox count — so it is not waited on alone.
 */
export async function settle(page: Page, language: Language): Promise<void> {
  const loading = textsFor(language).portalShell.loading;
  await page.locator('header').first().waitFor({ timeout: SETTLE_MS });
  // Let the app draw the new screen before looking: until then the old one shows.
  await page.waitForTimeout(REDRAW_MS);
  await page.waitForLoadState('networkidle', { timeout: SETTLE_MS / 3 }).catch(() => undefined);
  await page
    .waitForFunction((words) => !document.body.innerText.includes(words), loading, {
      timeout: SETTLE_MS,
    })
    .catch(() => undefined);
}

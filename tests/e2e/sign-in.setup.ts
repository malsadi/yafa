import { expect, test } from '@playwright/test';
import { TEST_OFFICERS } from '../../scripts/e2e/test-officers';
import { sessionFile } from './e2e-session';

// D-135: Clerk's development instance signs a `+clerk_test` address in with
// its fixed test code, and never emails it.
const TEST_CODE = '424242';

for (const officer of TEST_OFFICERS) {
  test(`${officer.key} signs in with Clerk's test code`, async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="identifier"]').fill(officer.email);
    // The code screen appears before Clerk has sent the code; wait for it.
    const codeSent = page.waitForResponse(
      (res) => res.url().includes('/prepare_first_factor') && res.ok(),
    );
    await page.locator('.cl-formButtonPrimary').click();
    await codeSent;
    // Clerk's code boxes sit under one real input, which takes the code.
    await page.locator('input[autocomplete="one-time-code"]').fill(TEST_CODE);
    await expect
      .poll(
        () =>
          page.evaluate(() => (window as { Clerk?: { user?: { id?: string } } }).Clerk?.user?.id),
        {
          message:
            'Signed in as a different Clerk user: if the test officers were recreated, update clerkUserId in scripts/e2e/test-officers.ts',
          timeout: 60_000,
        },
      )
      .toBe(officer.clerkUserId);
    await page.context().storageState({ path: sessionFile(officer.key) });
  });
}

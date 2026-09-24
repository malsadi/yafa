import { expect, test, type Page } from '@playwright/test';

// D-045: cards are native <details>; checkVisibility() is used because a
// closed <details> keeps a layout box, which ordinary visibility checks
// would count as visible.
async function openDetails(page: Page): Promise<boolean[]> {
  return page
    .locator('details.card .detail')
    .evaluateAll((details) => details.map((detail) => detail.checkVisibility()));
}

test.describe('progress page with JavaScript on', () => {
  test('opens only the phase in progress, and a card opens and closes on click', async ({
    page,
  }) => {
    await page.goto('/progress.html');
    const current = await page
      .locator('details.card')
      .evaluateAll((cards) => cards.map((card) => card.classList.contains('current')));

    expect(await openDetails(page)).toEqual(current);

    const first = page.locator('details.card summary').first();
    await first.click();
    expect((await openDetails(page))[0]).toBe(true);
    await first.click();
    expect((await openDetails(page))[0]).toBe(false);
  });
});

test.describe('progress page with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('simply shows every card open', async ({ page }) => {
    await page.goto('/progress.html');
    const details = await openDetails(page);

    expect(details.length).toBeGreaterThan(1);
    expect(details.every(Boolean)).toBe(true);
  });
});

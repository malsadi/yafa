import { expect, test, type Page } from '@playwright/test';

// D-058: one bar; each segment opens its phase's panel (a native popover).
// checkVisibility() is used because a hidden popover still has a box.
async function visiblePanels(page: Page): Promise<string[]> {
  return page
    .locator('section.panel')
    .evaluateAll((panels) => panels.filter((p) => p.checkVisibility()).map((p) => p.id));
}

for (const path of ['/progress.html', '/progress.ar.html']) {
  test.describe(`${path} with JavaScript on`, () => {
    test('opens a phase from its segment, and closes it by clicking elsewhere or Close', async ({
      page,
    }) => {
      await page.goto(path);
      expect(await visiblePanels(page)).toEqual([]);

      await page.locator('.segment button[popovertarget="phase-1"]').click();
      expect(await visiblePanels(page)).toEqual(['phase-1']);

      await page.mouse.click(5, 5);
      expect(await visiblePanels(page)).toEqual([]);

      await page.locator('.segment button[popovertarget="phase-0"]').click();
      await page.locator('#phase-0 .panel-close').click();
      expect(await visiblePanels(page)).toEqual([]);
    });
  });

  test.describe(`${path} with JavaScript off`, () => {
    test.use({ javaScriptEnabled: false });

    test('shows every phase, in order', async ({ page }) => {
      await page.goto(path);
      const all = await page
        .locator('section.panel')
        .evaluateAll((panels) => panels.map((p) => p.id));

      expect(all.length).toBeGreaterThan(1);
      expect(await visiblePanels(page)).toEqual(all);
    });
  });
}

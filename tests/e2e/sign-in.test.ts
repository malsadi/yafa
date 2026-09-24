import { expect, test } from '@playwright/test';

// Brief section 8.5: before sign-in, the browser's language decides — the
// whole page's direction and Clerk's own sign-in screens follow it.
test('a signed-out visitor sees the sign-in screen in their browser language', async ({
  page,
}, testInfo) => {
  const arabic = testInfo.project.name === 'arabic';

  await page.goto('/treasury');

  await expect(page.locator('.cl-signIn-root')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', arabic ? 'ar' : 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', arabic ? 'rtl' : 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    arabic ? 'تسجيل الدخول' : /Sign in/,
  );
  // D-043: invitation only, so no way to sign up is ever offered.
  await expect(page.locator('.cl-footerAction')).toBeHidden();
  await expect(
    page.getByText(arabic ? 'إنشاء حساب جديد' : 'Sign up', { exact: true }),
  ).toBeHidden();
});

// D-047: the progress page links to /portal; it reaches the same sign-in.
test('the portal link leads to the sign-in screen', async ({ page }) => {
  await page.goto('/portal');

  await expect(page.locator('.cl-signIn-root')).toBeVisible();
});

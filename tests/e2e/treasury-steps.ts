import type { Page } from '@playwright/test';
import { E2E_WORLD } from '../../scripts/e2e/e2e-world';
import { textsFor, type Language } from './e2e-session';

/** Brief 17 B2: a debit recorded on the bank account by the treasurer. */
export async function recordDebit(
  page: Page,
  language: Language,
  amount: string,
  description: string,
) {
  const t = textsFor(language).services.treasury;
  await page.goto('/treasury/accounts');
  await page.getByRole('link', { name: E2E_WORLD.bankAccount }).click();
  await page.getByRole('button', { name: t.entries.record.debit }).click();
  await page.getByLabel(t.entries.amount, { exact: true }).fill(amount);
  await page.getByLabel(t.entries.paidTo, { exact: true }).fill('Fictional supplier (test)');
  await page.getByLabel(t.entries.description, { exact: true }).fill(description);
  await page.getByRole('button', { name: t.entries.save }).click();
}

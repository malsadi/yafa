import { expect, test } from '@playwright/test';
import { asOfficer, languageOf, textsFor, uniqueName } from './e2e-session';
import { recordDebit } from './treasury-steps';

// Brief 27, 17 B5 and 7.3: a debit above the threshold waits, and a second
// officer approves it.
test('a debit above the threshold is approved by a second officer', async ({ browser }, info) => {
  const language = languageOf(info);
  const t = textsFor(language).services.treasury;
  const description = uniqueName('Fictional hall hire', language);
  const treasurer = await asOfficer(browser, 'treasurer', language);
  await recordDebit(treasurer, language, '250', description);
  await expect(treasurer.getByText(t.entries.saved['Awaiting approval'])).toBeVisible();

  const approver = await asOfficer(browser, 'approver', language);
  await approver.goto('/treasury/approvals');
  const item = approver.getByRole('listitem').filter({ hasText: description });
  await item.getByRole('button', { name: t.approvals.approve }).click();
  await expect(item).toBeHidden();
});

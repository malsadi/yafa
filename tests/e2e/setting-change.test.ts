import { expect, test } from '@playwright/test';
import { recordDebit } from './treasury-steps';
import { asOfficer, languageOf, textsFor, uniqueName } from './e2e-session';

// Brief 27 and 25 C1: the administrator lowers the approval threshold, and
// a debit that the old one let through now waits for a second officer.
test('a changed setting takes effect', async ({ browser }, info) => {
  const language = languageOf(info);
  const text = textsFor(language);
  const s = text.services['administration-panel'].serviceSettings;
  const name = text.services.treasury.settings['treasury.approval_threshold'];
  const administrator = await asOfficer(browser, 'administrator', language);
  await administrator.goto('/admin/configuration/service-settings');
  await administrator
    .getByRole('button', { name: s.changeSetting.replace('{setting}', name) })
    .click();
  await administrator.getByLabel(name, { exact: true }).fill('50');
  await administrator.getByRole('button', { name: s.save, exact: true }).click();
  await expect(administrator.getByLabel(name, { exact: true })).toBeHidden();

  const treasurer = await asOfficer(browser, 'treasurer', language);
  await recordDebit(treasurer, language, '75', uniqueName('Fictional flowers', language));
  await expect(
    treasurer.getByText(text.services.treasury.entries.saved['Awaiting approval']),
  ).toBeVisible();
});

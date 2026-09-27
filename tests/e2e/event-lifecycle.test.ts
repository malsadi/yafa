import { expect, test } from '@playwright/test';
import { E2E_WORLD } from '../../scripts/e2e/e2e-world';
import { fillText } from '../../src/web/text/fill-text';
import { asOfficer, languageOf, textsFor, uniqueName } from './e2e-session';

// A select's label wraps its options too, so selects are found by role.
// Brief 27 and 21's build note: create an event, have it approved by a
// second officer, move it to Completed, and close it into the bank account.
test('an event is created, approved, completed and closed', async ({ browser }, info) => {
  // The first close on a machine installs the local Chrome that makes the PDF.
  test.setTimeout(420_000);
  const language = languageOf(info);
  const e = textsFor(language).services['event-organiser'];
  const name = uniqueName('Fictional fair', language);
  const treasurer = await asOfficer(browser, 'treasurer', language);
  await treasurer.goto('/event-organiser/events/new');
  await treasurer.getByLabel(e.form.name, { exact: true }).fill(name);
  await treasurer.getByRole('combobox', { name: e.form.type }).selectOption({
    label: language === 'ar' ? E2E_WORLD.eventType.nameAr : E2E_WORLD.eventType.nameEn,
  });
  await treasurer
    .getByRole('combobox', { name: e.form.lead })
    .selectOption({ label: 'Fictional Treasurer (test)' });
  await treasurer.getByLabel(e.form.firstDay, { exact: true }).fill('2026-12-05');
  await treasurer.getByRole('button', { name: e.form.save }).click();
  await expect(treasurer.getByRole('heading', { name })).toBeVisible();
  const eventPage = new URL(treasurer.url()).pathname;

  const approver = await asOfficer(browser, 'approver', language);
  await approver.goto(eventPage);
  await approver.getByRole('button', { name: e.status.approve }).click();
  await expect(approver.getByText(e.statuses.Approved, { exact: true }).first()).toBeVisible();

  await treasurer.reload();
  for (const status of ['In preparation', 'Ready', 'Completed'] as const) {
    await treasurer
      .getByRole('button', { name: fillText(e.status.moveTo, { status: e.statuses[status] }) })
      .click();
    await expect(treasurer.getByText(e.statuses[status], { exact: true }).first()).toBeVisible();
  }
  await treasurer
    .getByRole('combobox', { name: e.close.account })
    .selectOption({ label: E2E_WORLD.bankAccount });
  await treasurer.getByRole('button', { name: e.close.confirm }).click();
  await expect(treasurer.getByText(e.statuses.Closed, { exact: true }).first()).toBeVisible({
    timeout: 300_000,
  });
});

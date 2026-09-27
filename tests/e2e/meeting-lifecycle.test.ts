import { expect, test, type Page } from '@playwright/test';
import { E2E_WORLD } from '../../scripts/e2e/e2e-world';
import { asOfficer, languageOf, textsFor, type Language } from './e2e-session';

const todayInLondon = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

const TREASURER = 'Fictional Treasurer (test)';
const APPROVER = 'Fictional Approver (test)';
const OFFICER = 'Fictional Officer (test)';

/** Brief 22 A1 to A3: the treasurer, who manages meetings, schedules one and sets its agenda. */
async function scheduleMeeting(page: Page, language: Language): Promise<string> {
  const t = textsFor(language).services['meeting-recorder'];
  await page.goto('/meeting-recorder/meetings/new');
  await page.getByRole('combobox', { name: t.form.type }).selectOption({
    label: language === 'ar' ? E2E_WORLD.meetingType.nameAr : E2E_WORLD.meetingType.nameEn,
  });
  await page.getByLabel(t.form.date, { exact: true }).fill(todayInLondon());
  await page.getByLabel(t.form.startTime, { exact: true }).fill('19:00');
  await page.getByLabel(t.form.place, { exact: true }).fill('Fictional hall (test)');
  await page.getByRole('combobox', { name: t.form.chair }).selectOption({ label: TREASURER });
  await page.getByRole('combobox', { name: t.form.secretary }).selectOption({ label: APPROVER });
  await page.getByRole('checkbox', { name: OFFICER }).check();
  await page.getByRole('button', { name: t.form.save }).click();
  await expect(page.getByText(t.statuses.Scheduled, { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: t.agenda.add }).click();
  await page.getByLabel(t.agenda.title, { exact: true }).fill('Fictional item (test)');
  await page.getByRole('button', { name: t.form.save }).click();
  await expect(page.getByText('Fictional item (test)')).toBeVisible();
  return new URL(page.url()).pathname;
}

// Brief 27 and 26 Phase 9: hold and log a meeting — scheduled, held,
// attendance marked, minutes written, and the report logged by the secretary.
test('a meeting is held and its report logged', async ({ browser }, info) => {
  test.setTimeout(420_000);
  const language = languageOf(info);
  const t = textsFor(language).services['meeting-recorder'];
  const meetingPage = await scheduleMeeting(
    await asOfficer(browser, 'treasurer', language),
    language,
  );

  const secretary = await asOfficer(browser, 'approver', language);
  await secretary.goto(meetingPage);
  await secretary.getByRole('button', { name: t.status.hold }).click();
  await expect(secretary.getByText(t.statuses.Held, { exact: true }).first()).toBeVisible();
  for (const name of [TREASURER, APPROVER, OFFICER]) {
    await secretary
      .getByRole('combobox', { name: `${t.attendees.mark} ${name}` })
      .selectOption({ label: t.attendance.Present });
  }
  const comment = secretary.getByRole('textbox', { name: OFFICER, exact: true });
  await comment.fill('Fictional comment (test).');
  await comment.locator('xpath=../..').getByRole('button', { name: t.minutes.save }).click();
  await expect(
    comment.locator('xpath=../..').getByRole('button', { name: t.minutes.saved }),
  ).toBeVisible();
  await secretary
    .getByLabel(t.outcome.decisionText, { exact: true })
    .fill('Fictional decision (test).');
  await secretary.getByRole('button', { name: t.outcome.save }).click();
  await secretary.getByRole('button', { name: t.status.log }).click();
  await expect(
    secretary.getByText(t.statuses['Report logged'], { exact: true }).first(),
  ).toBeVisible({
    timeout: 300_000,
  });
});

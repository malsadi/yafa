import { expect, test } from '@playwright/test';
import { E2E_WORLD } from '../../scripts/e2e/e2e-world';
import { fillText } from '../../src/web/text/fill-text';
import { asOfficer, languageOf, textsFor, uniqueName } from './e2e-session';

const todayInLondon = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

// Brief 27 and 20 A2: post a notice with a vote, and vote in it as another
// officer; then see the results of a vote once it has closed (P12).
test('a notice is put to a vote, voted in, and a closed vote shows its results', async ({
  browser,
}, info) => {
  test.setTimeout(360_000);
  const language = languageOf(info);
  const hub = textsFor(language).services['communication-hub'];
  const f = hub.noticeForm;
  const title = uniqueName('Fictional notice', language);
  const treasurer = await asOfficer(browser, 'treasurer', language);
  await treasurer.goto('/communication-hub/noticeboard');
  await treasurer.getByRole('button', { name: hub.noticeboard.post }).click();
  await treasurer.getByLabel(f.title, { exact: true }).fill(title);
  await treasurer.getByLabel(f.body, { exact: true }).fill('Fictional text (test).');
  await treasurer.getByLabel(f.withVote).check();
  await treasurer.getByLabel(f.question, { exact: true }).fill('Which day?');
  await treasurer.getByLabel(fillText(f.option, { number: 1 }), { exact: true }).fill('Saturday');
  await treasurer.getByLabel(fillText(f.option, { number: 2 }), { exact: true }).fill('Sunday');
  await treasurer.getByLabel(f.closesOn, { exact: true }).fill(todayInLondon());
  await treasurer.getByRole('button', { name: f.save }).click();
  await expect(treasurer.getByText(title)).toBeVisible();

  const officer = await asOfficer(browser, 'officer', language);
  await officer.goto('/communication-hub/noticeboard');
  const notice = officer.getByRole('listitem').filter({ hasText: title });
  await notice.getByLabel('Saturday').check();
  await notice.getByRole('button', { name: hub.vote.cast }).click();
  await expect(notice.getByText(fillText(hub.vote.youVoted, { option: 'Saturday' }))).toBeVisible();

  const closed = officer.getByRole('listitem').filter({ hasText: E2E_WORLD.closingVote.title });
  const counted = `${E2E_WORLD.closingVote.options[0]}: ${fillText(hub.vote.count, { count: 2 })}`;
  await expect(async () => {
    await officer.reload();
    await expect(closed.getByText(counted)).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 300_000, intervals: [10_000] });
});

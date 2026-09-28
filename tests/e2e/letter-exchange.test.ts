import { expect, test } from '@playwright/test';
import { E2E_LETTERS } from '../../scripts/e2e/e2e-letters';
import { fillText } from '../../src/web/text/fill-text';
import { asOfficer, languageOf, textsFor } from './e2e-session';

// Brief 27 and 26 Phase 10: send and receive a letter with a linked reply.
// The letter received is in the test world already (D-213 choice: its scan
// goes to R2 by a signed link the local server cannot give); its handling
// officer moves it on, and the reply is written, generated and linked.
test('a letter received is answered with a linked reply', async ({ browser }, info) => {
  test.setTimeout(420_000);
  const language = languageOf(info);
  const t = textsFor(language).services['correspondence-and-letters'];
  const received = E2E_LETTERS.lettersIn[language];
  const letterPage = `/correspondence-and-letters/letters-in/${received.id}`;

  // O-135: the approver handles it with no capability, and marks it awaiting a reply.
  const handler = await asOfficer(browser, 'approver', language);
  await handler.goto(letterPage);
  await handler
    .getByRole('button', {
      name: fillText(t.letter.moveTo, { status: t.statuses['Awaiting reply'] }),
    })
    .click();
  await expect(handler.getByText(t.statuses['Awaiting reply'], { exact: true })).toBeVisible();

  // 23 A2, B4: the treasurer writes the reply from it, on the letterhead.
  const writer = await asOfficer(browser, 'treasurer', language);
  await writer.goto(letterPage);
  await writer.getByRole('link', { name: t.letter.writeReply }).click();
  await writer
    .getByRole('combobox', { name: t.write.template })
    .selectOption({ label: E2E_LETTERS.template.title });
  await writer.getByLabel(t.write.recipientName, { exact: true }).fill(received.sender);
  await writer.getByLabel('venue', { exact: true }).fill('Fictional hall (test)');
  await writer.getByLabel('contact', { exact: true }).fill('Fictional manager (test)');
  await writer.getByRole('button', { name: t.write.generate }).click();
  await expect(writer.getByText(t.letter.exchange)).toBeVisible({ timeout: 300_000 });

  // O-144, O-146: the letter it answers is Replied, and the exchange links them.
  await writer.getByRole('link', { name: received.sender }).click();
  await expect(writer.getByText(t.statuses.Replied, { exact: true })).toBeVisible();
});

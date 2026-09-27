import type { Browser, Page, TestInfo } from '@playwright/test';
import { TEST_OFFICERS } from '../../scripts/e2e/test-officers';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

export type OfficerKey = (typeof TEST_OFFICERS)[number]['key'];
export type Language = 'en' | 'ar';

/** Where each test officer's signed-in session is kept between the sign-in step and the journeys. */
export const sessionFile = (key: OfficerKey) => `playwright/.auth/${key}.json`;

/** The journey's language: its project's (brief 28: every journey in both). */
export const languageOf = (info: TestInfo): Language =>
  info.project.name === 'arabic' ? 'ar' : 'en';

/** The portal's own words in that language, so a journey finds what an officer reads. */
export const textsFor = (language: Language) => (language === 'ar' ? arabicText : englishText);

/** A page signed in as one of the test officers, in the journey's language. */
export async function asOfficer(
  browser: Browser,
  key: OfficerKey,
  language: Language,
): Promise<Page> {
  const context = await browser.newContext({
    storageState: sessionFile(key),
    locale: language === 'ar' ? 'ar' : 'en-GB',
  });
  return context.newPage();
}

/** A name no other run or language uses, so journeys never find each other's records. */
export const uniqueName = (label: string, language: Language) =>
  `${label} ${language} ${String(Date.now())}`;

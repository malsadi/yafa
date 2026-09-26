import { describe, expect, it } from 'vitest';
import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../src/shared/administration-panel/capabilities';
import { COMMITTEE_REGISTER_CAPABILITIES } from '../../src/shared/committee-register/capabilities';
import { DOCUMENTS_ARCHIVE_CAPABILITIES } from '../../src/shared/documents-archive/capabilities';
import { RESOURCES_LIBRARY_CAPABILITIES } from '../../src/shared/resources-library/capabilities';
import { TREASURY_CAPABILITIES } from '../../src/shared/treasury/capabilities';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

// Every catalogued capability is named on screen in both languages
// (brief 8.5); the matrix screen (T-079) shows these, not the docs labels.
const SERVICES = [
  { slug: 'committee-register', capabilities: COMMITTEE_REGISTER_CAPABILITIES },
  { slug: 'administration-panel', capabilities: ADMINISTRATION_PANEL_CAPABILITIES },
  { slug: 'documents-archive', capabilities: DOCUMENTS_ARCHIVE_CAPABILITIES },
  { slug: 'resources-library', capabilities: RESOURCES_LIBRARY_CAPABILITIES },
  { slug: 'treasury', capabilities: TREASURY_CAPABILITIES },
] as const;

describe('capability names on screen', () => {
  for (const bundle of [englishText, arabicText]) {
    for (const { slug, capabilities } of SERVICES) {
      it(`${slug}: every capability has a name`, () => {
        const names: Record<string, string> = bundle.services[slug].capabilities;
        for (const { capability } of capabilities) {
          expect(names[capability], capability).toBeTruthy();
        }
        expect(Object.keys(names).sort()).toEqual(capabilities.map((c) => c.capability).sort());
      });
    }
  }
});

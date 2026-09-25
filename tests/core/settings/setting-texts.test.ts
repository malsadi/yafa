import { beforeAll, describe, expect, it } from 'vitest';
import { describeSettingInput } from '../../../src/worker/core/settings/describe-setting-input';
import {
  listSettingDefinitions,
  resetSettingsRegistryForTests,
} from '../../../src/worker/core/settings/settings-registry';
import { registerAdministrationPanelSettings } from '../../../src/worker/services/administration-panel/settings';
import { registerCommitteeRegisterSettings } from '../../../src/worker/services/committee-register/settings';
import { arabicText } from '../../../src/web/text/ar';
import { englishText } from '../../../src/web/text/en';

// Every registered setting is named on screen in both languages (brief
// 8.5): the set-up checklist (25 C6) shows these names, not the registry's.
const SERVICES = ['committee-register', 'administration-panel'] as const;

describe('setting names on screen', () => {
  beforeAll(() => {
    resetSettingsRegistryForTests();
    registerCommitteeRegisterSettings();
    registerAdministrationPanelSettings();
  });

  for (const bundle of [englishText, arabicText]) {
    for (const slug of SERVICES) {
      it(`${slug}: every setting has a name, and only registered ones`, () => {
        const names: Record<string, string> = bundle.services[slug].settings;
        const keys = listSettingDefinitions()
          .map((definition) => definition.key)
          .filter((key) => key.startsWith(`${slug}.`));
        expect(Object.keys(names).sort()).toEqual(keys.sort());
      });
    }
  }

  // D-074: a setting chosen from fixed options shows each option by name.
  for (const bundle of [englishText, arabicText]) {
    it('names every option of every choice setting', () => {
      const labels: Record<string, Record<string, string>> = bundle.services['administration-panel']
        .settingOptions;
      for (const definition of listSettingDefinitions()) {
        const input = describeSettingInput(definition);
        if (input.kind !== 'choice' && input.kind !== 'multi-choice') continue;
        expect(Object.keys(labels[definition.key] ?? {}).sort(), definition.key).toEqual(
          [...input.options].sort(),
        );
      }
    });
  }
});

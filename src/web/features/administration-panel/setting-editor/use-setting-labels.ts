import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

/** The on-screen name of each option a setting offers, in the officer's language. */
export function useSettingOptions(
  settingKey: string,
  input: SettingInput,
  roles: readonly NamedChoice[],
): [string, string][] {
  const { language } = useLanguage();
  const admin = useText().services['administration-panel'];
  const t = admin.serviceSettings;
  const labels: Partial<Record<string, Partial<Record<string, string>>>> = admin.settingOptions;
  switch (input.kind) {
    case 'choice':
    case 'multi-choice':
      return input.options.map((o) => [o, labels[settingKey]?.[o] ?? o]);
    case 'yes-no':
      return [
        ['true', t.yes],
        ['false', t.no],
      ];
    case 'roles':
      return roles.map((role) => [role.id, { en: role.nameEn, ar: role.nameAr }[language]]);
    default:
      return [];
  }
}

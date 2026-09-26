import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import type { Language } from '../../../../shared/core/languages';
import type { TextBundle } from '../../../text';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatMoneyGBP } from '../../../../shared/core/format-money-gbp';
import { scalarText } from './scalar-text';

/** A stored value as the officer reads it: option names, yes or no, a number, role names. */
export function settingValueText(
  text: TextBundle,
  language: Language,
  params: {
    settingKey: string;
    input: SettingInput;
    value: unknown;
    roles: readonly NamedChoice[];
  },
): string {
  const admin = text.services['administration-panel'];
  const t = admin.serviceSettings;
  const labels: Partial<Record<string, Partial<Record<string, string>>>> = admin.settingOptions;
  const fileTypes: Partial<Record<string, string>> = admin.fileTypes;
  const { input, value } = params;
  if (value === null || value === undefined) return t.notConfigured;
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  if (input.kind === 'money' && typeof value === 'number') return formatMoneyGBP(value, locale);
  if (input.kind === 'day-and-month' && typeof value === 'object') {
    const { month, day } = value as { month: number; day: number };
    const date = new Date(Date.UTC(2001, month - 1, day));
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(date);
  }
  if (typeof value === 'object' && !Array.isArray(value) && 'en' in value) {
    // A name in both languages (25 C3): shown in the officer's, English while the Arabic waits (D-022).
    const names = value as { en: string; ar: string | null };
    return language === 'ar' ? (names.ar ?? names.en) : names.en;
  }
  const name = (option: string) =>
    input.kind === 'roles'
      ? (params.roles.find((r) => r.id === option)?.[language === 'en' ? 'nameEn' : 'nameAr'] ??
        option)
      : (labels[params.settingKey]?.[option] ?? fileTypes[option] ?? option);
  if (Array.isArray(value))
    return value.length === 0 ? t.none : value.map((v) => name(scalarText(v))).join(', ');
  if (input.kind === 'yes-no') return value === true ? t.yes : t.no;
  return name(scalarText(value));
}

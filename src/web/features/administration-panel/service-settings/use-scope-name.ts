import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import { isNationalScope } from '../../../../shared/core/national-scope';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

/** A setting scope's name: "Portal-wide", or the unit's name in the officer's language. */
export function useScopeName(units: readonly NamedChoice[]): (scope: string) => string {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].serviceSettings;
  return (scope) => {
    if (isNationalScope(scope)) return t.portalWide;
    const unit = units.find((u) => u.id === scope);
    return unit ? { en: unit.nameEn, ar: unit.nameAr }[language] : scope;
  };
}

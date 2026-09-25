import type { AccessCheck } from '../../../../shared/administration-panel/access-check';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { capabilityName } from '../capability-name';

/** Brief 25 A4: one person's current terms and every capability they hold, with scope and source. */
export function AccessCheckResult({ check }: { check: AccessCheck }) {
  const { language } = useLanguage();
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.accessCheck;
  const named = (en: string, ar: string) => ({ en, ar })[language];
  const unitName = (unitId: string | null) => {
    const term = check.currentTerms.find((x) => x.unitId === unitId);
    return term ? named(term.unitNameEn, term.unitNameAr) : t.portalWide;
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{check.name}</h2>
      {check.isSystemAdministrator && <p>{t.isSystemAdministrator}</p>}
      <section>
        <h3 className="font-semibold">{t.currentTerms}</h3>
        {check.currentTerms.length === 0 ? (
          <p>{t.noCurrentTerms}</p>
        ) : (
          <ul className="list-disc ps-6">
            {check.currentTerms.map((term) => (
              <li key={`${term.unitId}-${term.roleNameEn}`}>
                {named(term.roleNameEn, term.roleNameAr)}, {named(term.unitNameEn, term.unitNameAr)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-semibold">{t.capabilities}</h3>
        {check.grants.length === 0 ? (
          <p>{t.noCapabilities}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {check.grants.map((grant) => (
              <li key={`${grant.capability}-${grant.scope}-${grant.unitId ?? ''}`}>
                <span className="font-medium">{capabilityName(text, grant.capability)}</span>
                {' · '}
                {admin.scopes[grant.scope]} · {unitName(grant.unitId)} · {t.sources[grant.source]}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

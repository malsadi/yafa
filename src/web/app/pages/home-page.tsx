import { PageHeading } from '../../components/page-heading';
import { useLanguage } from '../language/use-language';
import { useText } from '../language/use-text';
import { useSelectedUnit } from '../unit/use-selected-unit';

/**
 * D-035: the home page stays minimal — a welcome line and the officer's
 * unit, beside the navigation. No dashboard, counts or activity feed. The
 * officer's name joins it once the register holds names (Phase 1).
 */
export function HomePage() {
  const text = useText();
  const { unit } = useSelectedUnit();
  const { language } = useLanguage();
  return (
    <section>
      <PageHeading>{text.portalShell.home.welcome}</PageHeading>
      {unit && (
        <p>
          {text.portalShell.home.unit}:{' '}
          <span dir="auto">{{ en: unit.nameEn, ar: unit.nameAr }[language]}</span>
        </p>
      )}
    </section>
  );
}

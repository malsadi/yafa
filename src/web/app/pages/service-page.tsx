import { useParams } from 'react-router';
import { SERVICES, type ServiceSlug } from '../../../shared/core/services';
import { PageHeading } from '../../components/page-heading';
import { useText } from '../language/use-text';
import { useSelectedUnit } from '../unit/use-selected-unit';
import { NotFoundPage } from './not-found-page';

function isPortalService(slug: string | undefined): slug is ServiceSlug {
  return SERVICES.some((service) => service.slug === slug && slug !== 'administration-panel');
}

/**
 * A stage-one service's page — empty until its phase is built (brief
 * section 26, Phase 0). A service switched off for the selected unit is
 * hidden (brief section 8.4), so its page is not found.
 */
export function ServicePage() {
  const { serviceSlug } = useParams();
  const { unit } = useSelectedUnit();
  const text = useText();
  if (!isPortalService(serviceSlug) || !unit?.enabledServices.includes(serviceSlug)) {
    return <NotFoundPage />;
  }
  return <PageHeading>{text.services[serviceSlug].name}</PageHeading>;
}

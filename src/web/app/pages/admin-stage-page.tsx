import { useParams } from 'react-router';
import { PageHeading } from '../../components/page-heading';
import {
  ADMINISTRATION_PANEL_STAGES,
  type AdministrationPanelStage,
} from '../admin/administration-panel-stages';
import { useText } from '../language/use-text';
import { NotFoundPage } from './not-found-page';

function isStage(slug: string | undefined): slug is AdministrationPanelStage {
  return ADMINISTRATION_PANEL_STAGES.some((stage) => stage === slug);
}

/** One Administration panel stage — empty until its phase is built. */
export function AdminStagePage() {
  const { stageSlug } = useParams();
  const text = useText();
  if (!isStage(stageSlug)) {
    return <NotFoundPage />;
  }
  return <PageHeading>{text.services['administration-panel'].stages[stageSlug]}</PageHeading>;
}

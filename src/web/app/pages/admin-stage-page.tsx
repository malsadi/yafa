import { Link, useParams } from 'react-router';
import { PageHeading } from '../../components/page-heading';
import { heldAdminScreens } from '../admin/admin-area-access';
import {
  ADMINISTRATION_PANEL_STAGES,
  type AdministrationPanelStage,
} from '../admin/administration-panel-stages';
import { useText } from '../language/use-text';
import { useActiveSession } from '../session/use-active-session';
import { NotFoundPage } from './not-found-page';

function isStage(slug: string | undefined): slug is AdministrationPanelStage {
  return ADMINISTRATION_PANEL_STAGES.some((stage) => stage === slug);
}

/** One Administration panel stage, listing the screens built so far. */
export function AdminStagePage() {
  const { stageSlug } = useParams();
  const text = useText().services['administration-panel'];
  const { context } = useActiveSession();
  if (!isStage(stageSlug)) {
    return <NotFoundPage />;
  }
  const screens = heldAdminScreens(context.capabilities).filter(
    (screen) => screen.stage === stageSlug,
  );
  return (
    <section>
      <PageHeading>{text.stages[stageSlug]}</PageHeading>
      <ul className="flex flex-col gap-2">
        {screens.map((screen) => (
          <li key={screen.slug}>
            <Link to={`/admin/${screen.stage}/${screen.slug}`} className="underline">
              {text.screens[screen.slug]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

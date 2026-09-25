import { PageHeading } from '../../../components/page-heading';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { DesignationsSection } from './designations-section';
import { StandardRolesSection } from './standard-roles-section';

/**
 * Brief 25 B2: the standard roles (national register officer) and the
 * register officer designations — each section shown to those whose
 * capability its API checks (a UI hint; the server decides, T-042).
 */
export function RolesPage() {
  const admin = useText().services['administration-panel'];
  const { capabilities } = useActiveSession().context;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading>{admin.screens.roles}</PageHeading>
      {capabilities.includes('committee-register.standard-roles.manage') && (
        <StandardRolesSection />
      )}
      {capabilities.includes('administration-panel.role-designations.manage') && (
        <DesignationsSection />
      )}
    </div>
  );
}

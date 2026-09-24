import { Outlet } from 'react-router';
import { StatusMessage } from '../../components/status-message';
import { useText } from '../language/use-text';
import { AccessNotActivePage } from '../pages/access-not-active-page';
import { PrivacyNoticeAcknowledgePage } from '../pages/privacy-notice-acknowledge-page';
import { SelectedUnitProvider } from '../unit/selected-unit-provider';
import { ActiveSessionContext } from './active-session-context';
import { useMe } from './use-me';
import { useSavedLanguageSync } from './use-saved-language-sync';

/**
 * Chooses the one screen a signed-in person may see (brief section 6.2,
 * D-024, D-005): "access not active" (also while no notice is set), the
 * privacy notice to acknowledge, or the portal itself.
 */
export function SignedInShell() {
  const text = useText();
  const me = useMe();
  useSavedLanguageSync(me.data);

  if (me.isPending) {
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  }
  if (me.isError) {
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  }
  if (me.data.status === 'not-active' || me.data.status === 'notice-not-set') {
    return <AccessNotActivePage />;
  }
  if (me.data.status === 'notice-not-acknowledged') {
    return <PrivacyNoticeAcknowledgePage />;
  }
  return (
    <ActiveSessionContext value={me.data}>
      <SelectedUnitProvider units={me.data.units}>
        <Outlet />
      </SelectedUnitProvider>
    </ActiveSessionContext>
  );
}

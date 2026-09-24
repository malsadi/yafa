import { StatusMessage } from '../../components/status-message';
import { useText } from '../language/use-text';

export function NotFoundPage() {
  return <StatusMessage>{useText().portalShell.pageNotFound}</StatusMessage>;
}

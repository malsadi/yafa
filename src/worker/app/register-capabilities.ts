import { registerAdministrationPanelCapabilities } from '../services/administration-panel';
import { registerCommitteeRegisterCapabilities } from '../services/committee-register';

/** Every built service's capabilities into the catalogue (brief section 7.2). */
export function registerCapabilities(): void {
  registerCommitteeRegisterCapabilities();
  registerAdministrationPanelCapabilities();
}

import {
  registerAdministrationPanelCapabilities,
  registerAdministrationPanelSettings,
} from '../services/administration-panel';
import {
  registerCommitteeRegisterCapabilities,
  registerCommitteeRegisterSettings,
} from '../services/committee-register';
import { registerCommunicationHubSettings } from '../services/communication-hub';

/**
 * Every built service's capabilities into the catalogue (brief 7.2) and
 * settings into the registry (brief 8.1).
 */
export function registerCatalogues(): void {
  registerCommitteeRegisterCapabilities();
  registerAdministrationPanelCapabilities();
  registerCommitteeRegisterSettings();
  registerAdministrationPanelSettings();
  registerCommunicationHubSettings();
}

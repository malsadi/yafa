import {
  registerAdministrationPanelCapabilities,
  registerAdministrationPanelSettings,
} from '../services/administration-panel';
import {
  registerCommitteeRegisterCapabilities,
  registerCommitteeRegisterSettings,
} from '../services/committee-register';
import { registerCommunicationHubSettings } from '../services/communication-hub';
import { registerDocumentsArchiveCapabilities } from '../services/documents-archive';
import { registerResourcesLibraryCapabilities } from '../services/resources-library';
import { registerTreasuryCapabilities, registerTreasurySettings } from '../services/treasury';
import {
  registerTaskTrackerCapabilities,
  registerTaskTrackerSettings,
} from '../services/task-tracker';

/**
 * Every built service's capabilities into the catalogue (brief 7.2) and
 * settings into the registry (brief 8.1).
 */
export function registerCatalogues(): void {
  registerCommitteeRegisterCapabilities();
  registerAdministrationPanelCapabilities();
  registerDocumentsArchiveCapabilities();
  registerResourcesLibraryCapabilities();
  registerTreasuryCapabilities();
  registerTaskTrackerCapabilities();
  registerCommitteeRegisterSettings();
  registerAdministrationPanelSettings();
  registerCommunicationHubSettings();
  registerTreasurySettings();
  registerTaskTrackerSettings();
}

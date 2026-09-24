import type { ServiceSlug } from './services';

const ADMINISTRATION_PANEL: ServiceSlug = 'administration-panel';

/**
 * Whether a capability belongs to the Administration panel (its service
 * part, brief section 5.1). D-046: system administrators hold every one of
 * these portal-wide; D-021: the admin area shows to anyone holding one.
 */
export function isAdministrationPanelCapability(capability: string): boolean {
  return capability.split('.')[0] === ADMINISTRATION_PANEL;
}

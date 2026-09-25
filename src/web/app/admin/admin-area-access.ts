import { isAdministrationPanelCapability } from '../../../shared/core/administration-panel-capability';
import { ADMIN_SCREENS } from './admin-screens';
import type { AdministrationPanelStage } from './administration-panel-stages';

/** The admin screens this person holds a capability of (a UI hint; the server decides, T-042). */
export function heldAdminScreens(capabilities: readonly string[]) {
  return ADMIN_SCREENS.filter((screen) =>
    screen.capabilities.some((capability) => capabilities.includes(capability)),
  );
}

/**
 * Brief 25 build notes and D-072: the admin area opens for anyone holding
 * at least one administration capability — an Administration panel
 * capability, or the capability of a screen that lives in the panel, such
 * as the national register officer's units and standard roles (25 rules).
 */
export function hasAdministrationCapability(capabilities: readonly string[]): boolean {
  return (
    capabilities.some(isAdministrationPanelCapability) || heldAdminScreens(capabilities).length > 0
  );
}

/** The panel's stages holding at least one screen this person holds. */
export function heldAdminStages(capabilities: readonly string[]): AdministrationPanelStage[] {
  return [...new Set(heldAdminScreens(capabilities).map((screen) => screen.stage))];
}

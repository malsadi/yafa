import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../../shared/administration-panel/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 15's capabilities (brief section 25), into the catalogue (7.2). */
export function registerAdministrationPanelCapabilities(): void {
  ADMINISTRATION_PANEL_CAPABILITIES.forEach(registerCapability);
}

export { registerSystemAdministratorsRoutes } from './system-administrators/system-administrators.routes';
export { registerPermissionsMatrixRoutes } from './permissions-matrix/permissions-matrix.routes';
export { registerRoleDesignationsRoutes } from './role-designations/role-designations.routes';
export { registerAdministrationPanelSettings } from './settings';
export { registerOfficerAccountsRoutes } from './officer-accounts/officer-accounts.routes';
export { registerListsRoutes } from './lists/lists.routes';
export { listChoicesOf } from './lists/lists.repo';
export { registerAccessCheckRoutes } from './access-check/access-check.routes';
export { registerSetupChecklistRoutes } from './setup-checklist/setup-checklist.routes';
export { registerServiceSettingsRoutes } from './service-settings/service-settings.routes';
export { registerServiceSwitchesRoutes } from './service-switches/service-switches.routes';
export { registerNotificationsRoutes } from './notifications/notifications.routes';
export { findAdminText } from './admin-texts/admin-texts.repo';
export { registerTextsRoutes } from './admin-texts/texts.routes';
export { registerOfficerTextsRoutes } from './admin-texts/officer-texts.routes';

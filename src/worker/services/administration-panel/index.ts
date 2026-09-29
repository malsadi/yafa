import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../../shared/administration-panel/capabilities';
import { OPERATIONS_CAPABILITIES } from '../../../shared/administration-panel/operations-capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 15's capabilities (brief section 25), into the catalogue (7.2). */
export function registerAdministrationPanelCapabilities(): void {
  ADMINISTRATION_PANEL_CAPABILITIES.forEach(registerCapability);
  OPERATIONS_CAPABILITIES.forEach(registerCapability);
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
export { registerBrandingRoutes } from './branding/branding.routes';
export { registerLetterheadPreviewRoutes } from './branding/letterhead-preview.routes';
export type { PdfRendering } from './branding/pdf-rendering';
export { renderOnLetterhead } from './branding/render-on-letterhead';
export { renderBrandedPdf } from './branding/render-branded-pdf';
export { readBranding } from './branding/branding.service';
export { registerPublicBrandingRoutes } from './branding/public-branding.routes';
export { registerOfficerTextsRoutes } from './admin-texts/officer-texts.routes';
export { takeBackup, removeOldBackups } from './backups/backups.service';
export { registerMaintenanceModeRoutes } from './maintenance-mode/maintenance-mode.routes';
export { registerBackupsRoutes } from './backups/backups.routes';
export { registerAuditLogRoutes } from './audit-log/audit-log.routes';
export { registerSystemHealthRoutes } from './system-health/system-health.routes';
export { registerFileHousekeepingRoutes } from './file-housekeeping/file-housekeeping.routes';
export { registerDataImportRoutes } from './data-import/data-import.routes';

import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../../shared/administration-panel/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 15's capabilities (brief section 25), into the catalogue (7.2). */
export function registerAdministrationPanelCapabilities(): void {
  ADMINISTRATION_PANEL_CAPABILITIES.forEach(registerCapability);
}

export { registerSystemAdministratorsRoutes } from './system-administrators/system-administrators.routes';
export { registerPermissionsMatrixRoutes } from './permissions-matrix/permissions-matrix.routes';

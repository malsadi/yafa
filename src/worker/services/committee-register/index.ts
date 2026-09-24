import { COMMITTEE_REGISTER_CAPABILITIES } from '../../../shared/committee-register/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 8's capabilities (brief section 14), into the catalogue (7.2). */
export function registerCommitteeRegisterCapabilities(): void {
  COMMITTEE_REGISTER_CAPABILITIES.forEach(registerCapability);
}

export { registerBranchesRoutes } from './branches/branches.routes';
export { registerCommitteeRegisterSettings } from './settings';
export { registerRolesRoutes } from './roles/roles.routes';

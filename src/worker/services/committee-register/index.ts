import { COMMITTEE_REGISTER_CAPABILITIES } from '../../../shared/committee-register/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 8's capabilities (brief section 14), into the catalogue (7.2). */
export function registerCommitteeRegisterCapabilities(): void {
  COMMITTEE_REGISTER_CAPABILITIES.forEach(registerCapability);
}

export { registerBranchesRoutes } from './branches/branches.routes';
export { listUnits } from './branches/branches.repo';
export { registerRegisterUnitsRoutes } from './register-units/register-units.routes';
export { registerCommitteeRegisterSettings } from './settings';
export { registerRolesRoutes } from './roles/roles.routes';
export { listRoles, findRole } from './roles/roles.repo';
export type { RoleRecord } from './roles/roles.schema';
export { buildSetDesignationStatements } from './roles/role-designations.repo';
export { registerOfficersRoutes } from './officers/officers.routes';
export { sendInvitation } from './invitations/invitations.service';
export { latestInvitationAt } from './invitations/invitations.repo';
export { listAccountStates } from './invitations/account-states.repo';
export {
  lockAccount,
  unlockAccount,
  signOutEverywhere,
  removePushDevices,
  lockAccountsWhoseLastTermEnded,
} from './accounts/accounts.service';
export { registerHandoversRoutes } from './handovers/handovers.routes';
export {
  listCurrentOfficersOf,
  listCurrentTermsOf,
  listPeopleNames,
} from './officers/officers.repo';
export { registerElectionsRoutes } from './elections/elections.routes';

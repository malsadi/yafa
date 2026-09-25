import type { RouteDeclaration } from '../../../src/worker/core/permissions';

/** Brief 7.4: the committee-register routes, in the order the app registers them. */
export const COMMITTEE_REGISTER_SWEEP_ENTRIES: RouteDeclaration[] = [
  {
    method: 'GET',
    path: '/api/committee-register/branches',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/branches',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/branches/:unitId',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/calendar-colours',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/roles',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/roles',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/roles/:roleId',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'PUT',
    path: '/api/committee-register/roles/order',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/branch-roles-allowed',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'PUT',
    path: '/api/committee-register/branch-roles-allowed',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/branches/:unitId/roles',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/branches/:unitId/roles',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/branches/:unitId/roles/:roleId',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/officers',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/past-officers',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/units/:unitId/officers',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/people/:personId',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/terms/:termId',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/my-handovers',
    access: { kind: 'capability', capability: 'committee-register.handovers.confirm' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/handovers',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/units/:unitId/handovers',
    access: { kind: 'capability', capability: 'committee-register.handovers.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/handovers/:handoverId',
    access: { kind: 'capability', capability: 'committee-register.handovers.confirm' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/handovers/:handoverId/items',
    access: { kind: 'capability', capability: 'committee-register.handovers.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/committee-register/handovers/:handoverId/items/:itemId',
    access: { kind: 'capability', capability: 'committee-register.handovers.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/handovers/:handoverId/items/:itemId/tick',
    access: { kind: 'capability', capability: 'committee-register.handovers.confirm' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/handovers/:handoverId/confirm',
    access: { kind: 'capability', capability: 'committee-register.handovers.confirm' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/elections',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/units/:unitId/elections',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/elections/:electionId',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/elections/:electionId/positions',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/committee-register/elections/:electionId/positions/:positionId',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/elections/:electionId/positions/:positionId/candidates',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/committee-register/elections/:electionId/candidates/:candidateId',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'PUT',
    path: '/api/committee-register/elections/:electionId/results',
    access: { kind: 'capability', capability: 'committee-register.elections.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/elections/:electionId/confirm',
    access: { kind: 'capability', capability: 'committee-register.elections.confirm' },
  },
];

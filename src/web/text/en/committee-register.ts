export const committeeRegisterText = {
  name: 'Committee register',
  capabilities: {
    'committee-register.branches.manage': 'Add or change branches',
    'committee-register.standard-roles.manage': 'Maintain the standard roles',
    'committee-register.branch-roles.manage': "Add a branch's extra roles",
    'committee-register.officers.manage': 'Manage officers and terms',
    'committee-register.elections.manage': 'Record elections',
    'committee-register.elections.confirm': 'Confirm election results',
    'committee-register.handovers.manage': 'Set up handovers',
    'committee-register.handovers.confirm': 'Take part in a handover',
    'committee-register.register.read': 'Read the register',
  },
  settings: {
    'committee-register.branches_may_add_roles': 'Branches may add extra roles',
    'committee-register.lock_account_when_last_term_ends':
      'Lock the account when the last term ends',
    'committee-register.terms_ending_soon_window_days': 'Terms ending soon window (days)',
    'committee-register.roles_requiring_mfa': 'Roles requiring multi-factor authentication',
  },
};

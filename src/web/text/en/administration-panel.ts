export const administrationPanelText = {
  name: 'Administration panel',
  stages: {
    'access-and-permissions': 'Access and permissions',
    organisation: 'Organisation',
    configuration: 'Configuration',
    operations: 'Operations',
  },
  screens: {
    'permissions-matrix': 'Permissions matrix',
  },
  capabilities: {
    'administration-panel.system-administrators.manage': 'Appoint and remove system administrators',
    'administration-panel.officer-accounts.manage': 'Manage officer accounts',
    'administration-panel.permissions-matrix.manage': 'Edit the permissions matrix',
    'administration-panel.access-check.read': 'Use the access check',
    'administration-panel.role-designations.manage': 'Designate the register officer roles',
    'administration-panel.lists.manage': 'Manage lists',
    'administration-panel.setup-checklist.read': 'See the set-up checklist',
  },
  scopes: {
    'own unit': 'Own unit',
    'all units': 'All units',
    'national content': 'National content',
  },
  designations: {
    'Branch register officer': 'Branch register officer',
    'National register officer': 'National register officer',
  },
  permissionsMatrix: {
    intro:
      'For each capability, choose which roles hold it and where. Fixed rules are set by the portal and cannot be changed here.',
    version: 'Version {number}',
    fixedRule: 'Fixed rule',
    heldBy: 'Held by:',
    branchRole: 'branch role',
    noRoles: 'No roles have been set up yet.',
    saving: 'Saving…',
    changedElsewhere: 'Someone else changed the matrix. The latest version has been loaded.',
    history: 'History',
    noHistory: 'No changes yet.',
    versionBy: 'Version {number}, {date}, by {email}',
    changedCell: 'Changed {capability} for {role}',
    restoredVersion: 'Restored version {number}',
    restore: 'Restore this version',
    current: 'Current version',
  },
};

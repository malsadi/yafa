import { accessCheckText } from './access-check';
import { adminTextsText } from './admin-texts';
import { brandingText } from './branding';
import { listsText } from './lists';
import { notificationsText } from './notifications';
import { officerAccountsText } from './officer-accounts';
import { rolesText } from './roles';
import { serviceSettingsText } from './service-settings';
import { serviceSwitchesText } from './service-switches';
import { setupChecklistText } from './setup-checklist';
import { systemAdministratorsText } from './system-administrators';
import { textsText } from './texts';
import { unitsText } from './units';

export const administrationPanelText = {
  name: 'Administration panel',
  stages: {
    'access-and-permissions': 'Access and permissions',
    organisation: 'Organisation',
    configuration: 'Configuration',
    operations: 'Operations',
  },
  screens: {
    'system-administrators': 'System administrators',
    'officer-accounts': 'Officer accounts',
    'permissions-matrix': 'Permissions matrix',
    'access-check': 'Access check',
    units: 'Units',
    roles: 'Roles',
    lists: 'Lists',
    'setup-checklist': 'Set-up checklist',
    'service-settings': 'Service settings',
    'service-switches': 'Service switches',
    notifications: 'Notifications',
    texts: 'Texts',
    branding: 'Branding and letterhead',
  },
  capabilities: {
    'administration-panel.system-administrators.manage': 'Appoint and remove system administrators',
    'administration-panel.officer-accounts.manage': 'Manage officer accounts',
    'administration-panel.permissions-matrix.manage': 'Edit the permissions matrix',
    'administration-panel.access-check.read': 'Use the access check',
    'administration-panel.role-designations.manage': 'Designate the register officer roles',
    'administration-panel.lists.manage': 'Manage lists',
    'administration-panel.service-settings.manage': 'Manage service settings',
    'administration-panel.service-switches.manage': 'Switch services on and off',
    'administration-panel.notifications.manage': 'Set notification defaults',
    'administration-panel.texts.manage': 'Write the texts',
    'administration-panel.branding.manage': 'Set the branding and letterhead',
    'administration-panel.setup-checklist.manage':
      'Set required settings from the set-up checklist',
    'administration-panel.setup-checklist.read': 'See the set-up checklist',
  },
  settings: {
    'administration-panel.file_types_receipt_photos': 'Allowed file types: receipt photos',
    'administration-panel.file_size_limit_receipt_photos_mb': 'Size limit (MB): receipt photos',
    'administration-panel.file_types_documents': 'Allowed file types: documents',
    'administration-panel.file_size_limit_documents_mb': 'Size limit (MB): documents',
    'administration-panel.file_types_letter_scans': 'Allowed file types: letter scans',
    'administration-panel.file_size_limit_letter_scans_mb': 'Size limit (MB): letter scans',
    'administration-panel.file_types_media_images': 'Allowed file types: media images',
    'administration-panel.file_size_limit_media_images_mb': 'Size limit (MB): media images',
    'administration-panel.file_types_video': 'Allowed file types: video',
    'administration-panel.file_size_limit_video_mb': 'Size limit (MB): video',
    'administration-panel.file_types_branding_images': 'Allowed file types: branding images',
    'administration-panel.file_size_limit_branding_images_mb': 'Size limit (MB): branding images',
    'administration-panel.file_types_fonts': 'Allowed file types: fonts',
    'administration-panel.file_size_limit_fonts_mb': 'Size limit (MB): fonts',
    'administration-panel.download_link_threshold_mb': 'Download link size (MB)',
    'administration-panel.download_link_lifetime_minutes': 'Download link lifetime (minutes)',
    'administration-panel.max_image_dimension_px': 'Maximum image dimension (pixels)',
    'administration-panel.orphan_file_age_days': 'Orphan file age (days)',
    'administration-panel.organisation_name': 'Organisation name',
    'administration-panel.main_colour': 'Main colour',
    'administration-panel.accent_colour': 'Accent colour',
    'administration-panel.new_officer_language': 'Language new officers start with',
    'administration-panel.arabic_digits': 'Digits on Arabic screens',
  },
  fileTypes: {
    'image/jpeg': 'JPEG image',
    'image/png': 'PNG image',
    'image/webp': 'WebP image',
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'Word document (.docx)',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel workbook (.xlsx)',
    'video/mp4': 'MP4 video',
    'font/woff2': 'WOFF2 font',
    'font/ttf': 'TrueType font',
    'font/otf': 'OpenType font',
  },
  settingOptions: {
    'communication-hub.alert_types_for_new_officers': {
      notices: 'New notices',
      votes: 'Votes',
      replies: 'Replies',
      requests: 'Requests',
    },
    'administration-panel.new_officer_language': { en: 'English', ar: 'Arabic' },
    'administration-panel.arabic_digits': {
      western: 'Western digits (0-9)',
      'arabic-indic': 'Arabic-Indic digits (٠-٩)',
    },
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
  systemAdministrators: systemAdministratorsText,
  officerAccounts: officerAccountsText,
  accessCheck: accessCheckText,
  units: unitsText,
  roles: rolesText,
  lists: listsText,
  setupChecklist: setupChecklistText,
  serviceSettings: serviceSettingsText,
  serviceSwitches: serviceSwitchesText,
  notifications: notificationsText,
  adminTexts: adminTextsText,
  texts: textsText,
  branding: brandingText,
};

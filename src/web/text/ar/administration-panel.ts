import type { TextShape } from '../text-shape';
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
import type { administrationPanelText as english } from '../en/administration-panel';

export const administrationPanelText: TextShape<typeof english> = {
  name: 'لوحة الإدارة',
  stages: {
    'access-and-permissions': 'الوصول والصلاحيات',
    organisation: 'التنظيم',
    configuration: 'الإعدادات',
    operations: 'التشغيل',
  },
  screens: {
    'system-administrators': 'مسؤولو النظام',
    'officer-accounts': 'حسابات أعضاء اللجان',
    'permissions-matrix': 'مصفوفة الصلاحيات',
    'access-check': 'فحص الصلاحيات',
    units: 'الوحدات',
    roles: 'الأدوار',
    lists: 'القوائم',
    'setup-checklist': 'قائمة الإعداد',
    'service-settings': 'إعدادات الخدمات',
    'service-switches': 'تشغيل الخدمات',
    notifications: 'التنبيهات',
    texts: 'النصوص',
    branding: 'الهوية والترويسة',
  },
  capabilities: {
    'administration-panel.system-administrators.manage': 'تعيين مسؤولي النظام وإعفاؤهم',
    'administration-panel.officer-accounts.manage': 'إدارة حسابات أعضاء اللجان',
    'administration-panel.permissions-matrix.manage': 'تعديل مصفوفة الصلاحيات',
    'administration-panel.access-check.read': 'استخدام فحص الصلاحيات',
    'administration-panel.role-designations.manage': 'تحديد أدوار مسؤولي السجل',
    'administration-panel.lists.manage': 'إدارة القوائم',
    'administration-panel.service-settings.manage': 'إدارة إعدادات الخدمات',
    'administration-panel.service-switches.manage': 'تشغيل الخدمات وإيقافها',
    'administration-panel.notifications.manage': 'ضبط إعدادات التنبيهات الافتراضية',
    'administration-panel.texts.manage': 'كتابة النصوص',
    'administration-panel.branding.manage': 'ضبط الهوية والترويسة',
    'administration-panel.setup-checklist.manage': 'ضبط الإعدادات المطلوبة من قائمة الإعداد',
    'administration-panel.setup-checklist.read': 'عرض قائمة الإعداد',
  },
  settings: {
    'administration-panel.organisation_name': 'اسم المنظمة',
    'administration-panel.main_colour': 'اللون الرئيسي',
    'administration-panel.accent_colour': 'لون التمييز',
    'administration-panel.new_officer_language': 'اللغة التي يبدأ بها أعضاء اللجان الجدد',
    'administration-panel.arabic_digits': 'الأرقام في الشاشات العربية',
  },
  settingOptions: {
    'communication-hub.alert_types_for_new_officers': {
      notices: 'الإعلانات الجديدة',
      votes: 'التصويتات',
      replies: 'الردود',
      requests: 'الطلبات',
    },
    'administration-panel.new_officer_language': { en: 'الإنجليزية', ar: 'العربية' },
    'administration-panel.arabic_digits': {
      western: 'الأرقام الغربية (0-9)',
      'arabic-indic': 'الأرقام العربية الهندية (٠-٩)',
    },
  },
  scopes: {
    'own unit': 'الوحدة الخاصة',
    'all units': 'جميع الوحدات',
    'national content': 'المحتوى الوطني',
  },
  designations: {
    'Branch register officer': 'مسؤول سجل الفرع',
    'National register officer': 'مسؤول السجل الوطني',
  },
  permissionsMatrix: {
    intro:
      'لكل صلاحية، اختر الأدوار التي تملكها ونطاقها. القواعد الثابتة تحددها البوابة ولا يمكن تغييرها هنا.',
    version: 'الإصدار {number}',
    fixedRule: 'قاعدة ثابتة',
    heldBy: 'يملكها:',
    branchRole: 'دور خاص بالفرع',
    noRoles: 'لم يتم إعداد أي أدوار بعد.',
    saving: 'جارٍ الحفظ…',
    changedElsewhere: 'قام شخص آخر بتغيير المصفوفة. تم تحميل أحدث إصدار.',
    history: 'السجل',
    noHistory: 'لا توجد تغييرات بعد.',
    versionBy: 'الإصدار {number}، {date}، بواسطة {email}',
    changedCell: 'تم تغيير {capability} للدور {role}',
    restoredVersion: 'تمت استعادة الإصدار {number}',
    restore: 'استعادة هذا الإصدار',
    current: 'الإصدار الحالي',
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

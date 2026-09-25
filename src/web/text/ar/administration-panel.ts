import type { TextShape } from '../text-shape';
import { accessCheckText } from './access-check';
import { officerAccountsText } from './officer-accounts';
import { rolesText } from './roles';
import { systemAdministratorsText } from './system-administrators';
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
    'officer-accounts': 'حسابات المسؤولين',
    'permissions-matrix': 'مصفوفة الصلاحيات',
    'access-check': 'فحص الوصول',
    units: 'الوحدات',
    roles: 'المناصب',
  },
  capabilities: {
    'administration-panel.system-administrators.manage': 'تعيين مسؤولي النظام وإعفاؤهم',
    'administration-panel.officer-accounts.manage': 'إدارة حسابات أعضاء اللجان',
    'administration-panel.permissions-matrix.manage': 'تعديل مصفوفة الصلاحيات',
    'administration-panel.access-check.read': 'استخدام فحص الصلاحيات',
    'administration-panel.role-designations.manage': 'تحديد أدوار مسؤولي السجل',
    'administration-panel.lists.manage': 'إدارة القوائم',
    'administration-panel.setup-checklist.read': 'عرض قائمة الإعداد',
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
};

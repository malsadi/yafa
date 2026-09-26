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
    'administration-panel.logo_file': 'الشعار',
    'administration-panel.small_icon_file': 'الأيقونة المربعة (192 بكسل)',
    'administration-panel.large_icon_file': 'الأيقونة المربعة (512 بكسل)',
    'administration-panel.latin_font_file': 'الخط اللاتيني',
    'administration-panel.arabic_font_file': 'الخط العربي',
    'administration-panel.logo_position': 'موضع الشعار',
    'administration-panel.file_types_receipt_photos': 'أنواع الملفات المسموح بها: صور الإيصالات',
    'administration-panel.file_size_limit_receipt_photos_mb':
      'الحد الأقصى للحجم (ميغابايت): صور الإيصالات',
    'administration-panel.file_types_documents': 'أنواع الملفات المسموح بها: المستندات',
    'administration-panel.file_size_limit_documents_mb': 'الحد الأقصى للحجم (ميغابايت): المستندات',
    'administration-panel.file_types_letter_scans':
      'أنواع الملفات المسموح بها: الخطابات الممسوحة ضوئيًا',
    'administration-panel.file_size_limit_letter_scans_mb':
      'الحد الأقصى للحجم (ميغابايت): الخطابات الممسوحة ضوئيًا',
    'administration-panel.file_types_media_images': 'أنواع الملفات المسموح بها: صور الوسائط',
    'administration-panel.file_size_limit_media_images_mb':
      'الحد الأقصى للحجم (ميغابايت): صور الوسائط',
    'administration-panel.file_types_video': 'أنواع الملفات المسموح بها: الفيديو',
    'administration-panel.file_size_limit_video_mb': 'الحد الأقصى للحجم (ميغابايت): الفيديو',
    'administration-panel.file_types_branding_images': 'أنواع الملفات المسموح بها: صور الهوية',
    'administration-panel.file_size_limit_branding_images_mb':
      'الحد الأقصى للحجم (ميغابايت): صور الهوية',
    'administration-panel.file_types_fonts': 'أنواع الملفات المسموح بها: الخطوط',
    'administration-panel.file_size_limit_fonts_mb': 'الحد الأقصى للحجم (ميغابايت): الخطوط',
    'administration-panel.download_link_threshold_mb': 'حجم رابط التنزيل (ميغابايت)',
    'administration-panel.download_link_lifetime_minutes': 'مدة صلاحية رابط التنزيل (بالدقائق)',
    'administration-panel.max_image_dimension_px': 'أقصى بُعد للصورة (بالبكسل)',
    'administration-panel.orphan_file_age_days': 'عمر الملف اليتيم (بالأيام)',
    'administration-panel.organisation_name': 'اسم المنظمة',
    'administration-panel.main_colour': 'اللون الرئيسي',
    'administration-panel.accent_colour': 'لون التمييز',
    'administration-panel.new_officer_language': 'اللغة التي يبدأ بها أعضاء اللجان الجدد',
    'administration-panel.arabic_digits': 'الأرقام في الشاشات العربية',
  },
  fileTypes: {
    'image/jpeg': 'صورة JPEG',
    'image/png': 'صورة PNG',
    'image/webp': 'صورة WebP',
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'مستند Word (.docx)',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'مصنف Excel (.xlsx)',
    'video/mp4': 'فيديو MP4',
    'font/woff2': 'خط WOFF2',
    'font/ttf': 'خط TrueType',
    'font/otf': 'خط OpenType',
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

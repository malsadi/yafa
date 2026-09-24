import type { TextShape } from '../text-shape';
import type { portalShellText as english } from '../en/portal-shell';

export const portalShellText: TextShape<typeof english> = {
  loading: 'جارٍ التحميل…',
  notConfigured: 'لم يتم إعداد هذا بعد. يرجى التواصل مع المسؤول.',
  somethingWentWrong: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  pageNotFound: 'هذه الصفحة غير موجودة.',
  signOut: 'تسجيل الخروج',
  home: {
    welcome: 'مرحبًا بك في بوابة اللجنة.',
    unit: 'الوحدة',
  },
  secondFactorRequired: {
    title: 'التحقق بخطوتين مطلوب',
    explanation:
      'يجب على مسؤولي النظام استخدام التحقق بخطوتين لاستخدام البوابة. قم بإعداده أدناه، ثم سجّل الخروج وسجّل الدخول مرة أخرى.',
  },
  accessNotActive: {
    title: 'الوصول غير مفعّل',
  },
  privacyNotice: {
    title: 'إشعار الخصوصية',
    confirm: 'لقد قرأت هذا',
    continue: 'متابعة',
    changed: 'تم تحديث إشعار الخصوصية للتو. يرجى قراءة النسخة الجديدة.',
  },
  navigation: {
    label: 'الخدمات',
    administration: 'لوحة الإدارة',
  },
  footer: {
    privacyNotice: 'إشعار الخصوصية',
  },
  language: {
    label: 'اللغة',
    // Each language is always named in its own script, in both bundles.
    en: 'English',
    ar: 'العربية',
  },
  unitSwitcher: {
    label: 'الوحدة',
  },
  maintenanceBanner: 'البوابة في وضع الصيانة. يمكنك الاطلاع على كل شيء دون إجراء أي تغيير.',
};

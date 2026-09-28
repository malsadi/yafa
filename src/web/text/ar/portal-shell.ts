import type { TextShape } from '../text-shape';
import type { portalShellText as english } from '../en/portal-shell';

export const portalShellText: TextShape<typeof english> = {
  loading: 'جارٍ التحميل…',
  notConfigured: 'لم يتم إعداد هذا بعد. يرجى التواصل مع المسؤول.',
  somethingWentWrong: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  refusals: {
    'rate-limit.too-many': 'طلبات كثيرة في وقت قصير. يُرجى الانتظار دقيقة ثم المحاولة مرة أخرى.',
    'maintenance-mode.read-only': 'البوابة للقراءة فقط بسبب الصيانة. يُرجى المحاولة لاحقًا.',
  },
  pageNotFound: 'هذه الصفحة غير موجودة.',
  signOut: 'تسجيل الخروج',
  home: {
    welcome: 'مرحبًا بك في بوابة اللجنة.',
    unit: 'الوحدة',
  },
  secondFactorRequired: {
    title: 'التحقق بخطوتين مطلوب',
    explanation:
      'يتطلب وصولك التحقق بخطوتين. قم بإعداده أدناه، ثم سجّل الخروج وسجّل الدخول مرة أخرى.',
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
  inbox: {
    link: 'الإشعارات',
    linkUnread: 'الإشعارات ({count} غير مقروءة)',
    heading: 'الإشعارات',
    none: 'لا توجد إشعارات.',
    unread: 'غير مقروء',
    markAllRead: 'تعليم الكل كمقروء',
    open: 'تعليم كمقروء',
    kinds: {
      'task-tracker.due-soon': 'تذكير: موعد استحقاق "{title}" في {dueDate}.',
      'task-tracker.overdue': 'كان موعد استحقاق "{title}" في {dueDate}، وهي متأخرة.',
      'communication-hub.notice': 'إعلان جديد في {unit}: «{title}».',
      'communication-hub.vote': 'تصويت جديد في {unit}: «{title}». أنت من المصوّتين فيه.',
      'communication-hub.vote-result': 'صدرت نتيجة التصويت «{title}» في {unit}.',
      'communication-hub.circular': 'تعميم وطني جديد: «{title}».',
      'communication-hub.request': 'طلب جديد من {unit}: «{title}».',
      'communication-hub.discussion': 'نقاش جديد: «{about}».',
      'communication-hub.reply': 'رد جديد في «{about}».',
    },
    unknown: 'إشعار.',
  },
  navigation: {
    label: 'الخدمات',
    administration: 'لوحة الإدارة',
  },
  footer: {
    privacyNotice: 'إشعار الخصوصية',
    help: 'المساعدة',
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
  bilingualName: {
    nameEn: 'الاسم بالإنجليزية',
    nameAr: 'الاسم بالعربية',
    rename: 'إعادة التسمية',
    renameItem: 'إعادة تسمية {name}',
    save: 'حفظ',
    cancel: 'إلغاء',
  },
  order: {
    moveUp: 'أعلى',
    moveDown: 'أسفل',
    moveUpItem: 'نقل {name} إلى الأعلى',
    moveDownItem: 'نقل {name} إلى الأسفل',
  },
  help: {
    title: 'المساعدة',
  },
};

import type { TextShape } from '../text-shape';
import type { libraryResourcesText as english } from '../en/library-resources';

export const libraryResourcesText: TextShape<typeof english> = {
  headings: { template: 'النماذج', guide: 'الأدلة' },
  explanation: {
    template:
      'الاستمارات وكشوف الحضور وتصاميم المنشورات والملصقات، وغيرها من الملفات الجاهزة للاستخدام.',
    guide: 'أدلة المناصب والإجراءات وأدلة الإرشاد للمسؤولين.',
  },
  none: 'لا يوجد شيء هنا بعد.',
  add: { template: 'إضافة نموذج', guide: 'إضافة دليل' },
  file: 'الملف',
  title: 'العنوان',
  description: 'الوصف (اختياري)',
  language: 'لغة الملف',
  languages: { en: 'الإنجليزية', ar: 'العربية' },
  save: 'حفظ',
  cancel: 'إلغاء',
  edit: 'تعديل التفاصيل',
  replace: 'استبدال الملف',
  replaceExplanation: 'يظهر الملف الجديد من الآن؛ ويُحتفظ بالقديم.',
  download: 'تنزيل',
  retire: 'إيقاف',
  restore: 'إعادة',
  national: 'المجلس العام',
  retired: 'موقوف',
  refusals: {
    'permission.denied': 'لا يحق لك القيام بذلك.',
    'resources-library.stale': 'عدّل شخص آخر هذا. أعد تحميل الصفحة لترى تعديله.',
    'resources-library.resource-not-found': 'هذا لم يعد موجودًا.',
    'resources-library.already-retired': 'هذا موقوف بالفعل.',
    'resources-library.not-retired': 'هذا غير موقوف.',
    'branches.inactive': 'هذا الفرع غير نشط، لذا فمكتبته للاطلاع فقط.',
    'files.type-not-allowed': 'نوع هذا الملف غير مسموح به للوثائق.',
    'files.too-large': 'حجم هذا الملف أكبر من الحد المسموح به للوثائق.',
    'files.storage-not-configured': 'لم يُجهَّز تخزين الملفات بعد.',
    'files.upload-failed': 'لم يكتمل الرفع. حاول مرة أخرى.',
    'files.not-uploaded': 'لم يكتمل الرفع. حاول مرة أخرى.',
    'setting.not-configured': 'لم يتم إعداد هذا بعد. يرجى التواصل مع المسؤول.',
  },
};

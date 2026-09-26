import type { TextShape } from '../text-shape';
import type { letterTemplatesText as english } from '../en/letter-templates';

export const letterTemplatesText: TextShape<typeof english> = {
  heading: 'نماذج الرسائل',
  none: 'لا توجد نماذج رسائل بعد.',
  national: 'المجلس العام',
  retired: 'موقوف',
  languages: { en: 'الإنجليزية', ar: 'العربية' },
  newTemplate: 'نموذج رسالة جديد',
  edit: 'تعديل',
  retire: 'إيقاف',
  restore: 'إعادة',
  cancel: 'إلغاء',
  save: 'حفظ',
  saved: 'تم الحفظ.',
  title: 'العنوان',
  subject: 'الموضوع',
  body: 'نص الرسالة',
  language: 'لغة الرسالة',
  fields: 'الحقول',
  fieldsExplanation:
    'سمِّ كل معلومة تُملأ عند كتابة الرسالة، مثل المرسل إليه. أدرج الحقل في الموضوع أو النص بزرّه: يظهر باسمه بين قوسين معقوفين مزدوجين.',
  fieldName: 'اسم الحقل',
  addField: 'إضافة حقل',
  insertField: 'إدراج {name}',
  removeField: 'حذف {name}',
  preview: 'معاينة على الورق الرسمي',
  previewNotReady: 'تحتاج المعاينة إلى ضبط اسم المنظمة والألوان وموضع الشعار في شاشة الهوية.',
  sample: {
    logo: 'الشعار',
    signer: { name: 'الموقِّع', role: 'منصبه' },
  },
  refusals: {
    'permission.denied': 'لا يحق لك القيام بذلك.',
    'resources-library.stale': 'عدّل شخص آخر نموذج الرسالة هذا. أعد تحميله لترى تعديله.',
    'resources-library.letter-template-not-found': 'نموذج الرسالة هذا لم يعد موجودًا.',
    'resources-library.already-retired': 'نموذج الرسالة هذا موقوف بالفعل.',
    'resources-library.not-retired': 'نموذج الرسالة هذا غير موقوف.',
    'branches.inactive': 'هذا الفرع غير نشط، لذا فمكتبته للاطلاع فقط.',
    'request.invalid':
      'راجع النموذج: يجب أن يكون كل حقل مستخدم في قائمة الحقول، وأن يُسمّى مرة واحدة.',
  },
};

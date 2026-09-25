import type { TextShape } from '../text-shape';
import type { unitsText as english } from '../en/units';

export const unitsText: TextShape<typeof english> = {
  intro:
    'المجلس العام وكل الفروع. يُستخدم رمز الفرع أيضًا في أرقام مراجع الخطابات. مسؤول السجل الوطني وحده يستطيع تغيير الوحدات.',
  code: 'الرمز',
  nameEn: 'الاسم بالإنجليزية',
  nameAr: 'الاسم بالعربية',
  area: 'المنطقة',
  status: 'الحالة',
  chooseStatus: 'اختر الحالة',
  statuses: { active: 'نشط', inactive: 'غير نشط' },
  letterheadAddressEn: 'عنوان الترويسة بالإنجليزية',
  letterheadAddressAr: 'عنوان الترويسة بالعربية',
  calendarColour: 'لون التقويم',
  noCalendarColour: 'لم يُختر لون',
  retiredCalendarColour: 'لونها الحالي (لم يعد معروضًا)',
  colourInUse: 'تستخدمه وحدة أخرى',
  noColourFree:
    'كل ألوان التقويم مستخدمة من وحدات أخرى. أضف لونًا آخر من صفحة القوائم، أو اطلب ذلك ممن يدير القوائم.',
  edit: 'تعديل',
  editUnit: 'تعديل {name}',
  save: 'حفظ',
  cancel: 'إلغاء',
  addBranch: 'إضافة فرع',
  add: 'إضافة الفرع',
  refusals: {
    'branches.code-taken': 'هذا الرمز مستخدم لوحدة أخرى.',
    'branches.general-council-has-no-area': 'ليس للمجلس العام منطقة.',
    'branches.general-council-always-active': 'المجلس العام نشط دائمًا.',
    'branches.not-found': 'لم تعد هذه الوحدة موجودة.',
    'branches.calendar-colour-not-offered': 'لم يعد هذا اللون معروضًا. اختر لونًا آخر.',
    'branches.calendar-colour-taken':
      'تستخدم وحدة أخرى هذا اللون. اختر لونًا آخر، أو أضف لونًا آخر من صفحة القوائم.',
    'request.invalid': 'تحقّق من الحقول: كلها مطلوبة، والرمز يتكوّن من حروف وأرقام وشرطات فقط.',
  },
};

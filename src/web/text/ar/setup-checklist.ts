import type { TextShape } from '../text-shape';
import type { setupChecklistText as english } from '../en/setup-checklist';

export const setupChecklistText: TextShape<typeof english> = {
  intro: 'كل ما هو مطلوب ولم يُضبط بعد، حسب الخدمة. لا يمكن تشغيل خدمة لوحدة ما حتى تكتمل قائمتها.',
  complete: 'لا شيء بانتظار الإعداد: كل ما هو مطلوب مضبوط.',
  privacyNotice: 'اضبط إشعار الخصوصية. وهو مطلوب قبل أي شيء آخر.',
  designation: 'عيّن دورًا قياسيًا بصفة {designation}.',
  setting: 'اضبط «{setting}».',
  choose: 'اختر',
  yes: 'نعم',
  no: 'لا',
  save: 'حفظ',
  refusals: {
    'setup-checklist.already-set': 'ضُبط هذا الإعداد بالفعل. يُغيَّر من صفحة إعدادات الخدمات.',
    'setup-checklist.not-a-required-setting': 'هذا ليس إعدادًا مطلوبًا.',
    'request.invalid': 'هذه القيمة غير مسموح بها لهذا الإعداد.',
  },
};

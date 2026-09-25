import type { TextShape } from '../text-shape';
import type { notificationsText as english } from '../en/notifications';

export const notificationsText: TextShape<typeof english> = {
  alertTypes: 'التنبيهات لأعضاء اللجان الجدد',
  alertTypesIntro:
    'التنبيهات التي يبدأ بها عضو اللجنة الجديد. يمكن لكل عضو تغيير تنبيهاته لاحقًا. تصل التعاميم الوطنية دائمًا.',
  notSetYet: 'لم تُضبط بعد: لا يُحدَّد شيء حتى تحفظ.',
  alwaysOn: 'مفعّل دائمًا',
  installGuide: 'دليل التثبيت على آيفون',
  installGuideIntro:
    'يُعرض لأعضاء اللجان على آيفون: لا تصل التنبيهات إلى آيفون إلا بعد إضافة البوابة إلى الشاشة الرئيسية.',
  save: 'حفظ',
  refusals: {
    'request.invalid': 'تحقّق مما أدخلته: النص الإنجليزي مطلوب.',
  },
};

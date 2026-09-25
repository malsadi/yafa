import type { TextShape } from '../text-shape';
import type { textsText as english } from '../en/texts';

export const textsText: TextShape<typeof english> = {
  privacyNotice: 'إشعار الخصوصية',
  privacyNoticeIntro:
    'يُعرض لكل عضو لجنة عند أول تسجيل دخول ومن تذييل الصفحة. يُنشر كل تغيير إصدارًا جديدًا، ويقرؤه كل عضو من جديد في المرة التالية التي يفتح فيها البوابة. تُحفظ الإصدارات السابقة.',
  noNotice:
    'لا يوجد إشعار خصوصية بعد. وحتى يُنشر، لا يستطيع أحد استخدام البوابة بعد صفحة «الوصول غير نشط».',
  versionOn: 'إصدار {date}',
  current: 'الحالي',
  arabicMissing: 'النص العربي غير مكتوب',
  publish: 'النشر إصدارًا جديدًا',
  publishConfirm: 'أفهم أن كل عضو، وأنا منهم، سيُطلب منه قراءته من جديد.',
  accessNotActive: 'رسالة «الوصول غير نشط»',
  accessNotActiveIntro:
    'تُعرض لكل من سجّل الدخول ووصوله غير نشط: لا فترة عضوية حالية، أو لا إشعار خصوصية بعد.',
  help: 'المساعدة',
  helpIntro: 'تُعرض في صفحة المساعدة، المرتبطة من تذييل الصفحة.',
  refusals: {
    'request.invalid': 'النص الإنجليزي مطلوب.',
  },
};

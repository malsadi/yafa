import type { TextShape } from '../text-shape';
import type { serviceSwitchesText as english } from '../en/service-switches';

export const serviceSwitchesText: TextShape<typeof english> = {
  intro:
    'شغّل كل خدمة أو أوقفها للبوابة كلها، أو أعطِ وحدة حالة خاصة بها. الخدمة الموقوفة تُخفى وتُحفظ بياناتها. لا تُشغَّل خدمة إلا بعد اكتمال إعدادها.',
  portalWide: 'على مستوى البوابة',
  portalWideOf: '{service}، على مستوى البوابة',
  unitOf: '{service} لـ {unit}',
  addUnit: 'إعطاء وحدة حالة خاصة بها',
  addUnitOf: 'إعطاء وحدة حالة خاصة بها لـ {service}',
  chooseUnit: 'اختر وحدة',
  on: 'تعمل',
  off: 'موقوفة',
  follow: 'كما هي على مستوى البوابة',
  alwaysOn: 'تعمل دائمًا: لا يمكن إيقاف هذه الخدمة.',
  needs: 'تحتاج إلى: {services}',
  refusals: {
    'service-switches.needs-service': 'تحتاج هذه الخدمة إلى خدمة أخرى موقوفة هناك. شغّلها أولًا.',
    'service-switches.needed-by-service':
      'تحتاج خدمة أخرى تعمل هناك إلى هذه الخدمة. أوقف تلك أولًا.',
    'service-switches.setup-incomplete': 'لم يكتمل إعدادها هناك: راجع قائمة الإعداد.',
    'service-switches.always-on': 'لا يمكن إيقاف هذه الخدمة.',
    'service-switches.portal-wide-cannot-be-cleared':
      'الحالة على مستوى البوابة إما تعمل أو موقوفة.',
    'service-switches.no-such-service': 'لا توجد خدمة بهذا الاسم.',
    'branches.not-found': 'لم تعد هذه الوحدة موجودة.',
  },
};

import type { TextShape } from '../text-shape';
import type { systemAdministratorsText as english } from '../en/system-administrators';

export const systemAdministratorsText: TextShape<typeof english> = {
  intro:
    'يُعيَّن مسؤولو النظام من المجلس العام، ويجب أن يسجّلوا الدخول بعامل تحقق ثانٍ. يبقى اثنان منهم على الأقل دائمًا.',
  appointedOn: 'عُيّن في {date}',
  remove: 'إزالة {name}',
  minimumNote: 'يجب أن يبقى اثنان على الأقل من مسؤولي النظام، لذا لا يمكن إزالة أحد الآن.',
  appointHeading: 'تعيين مسؤول نظام',
  officer: 'عضو اللجنة',
  chooseOfficer: 'اختر عضو لجنة',
  appoint: 'تعيين',
  noCandidates: 'لا يوجد شخص آخر يشغل حاليًا دورًا في المجلس العام.',
  refusals: {
    'system-administrators.minimum-two':
      'يجب أن يبقى اثنان على الأقل من مسؤولي النظام، لذا لم تتم الإزالة.',
    'system-administrators.already-appointed': 'عضو اللجنة هذا مسؤول نظام بالفعل.',
    'system-administrators.needs-general-council-term':
      'لا يمكن تعيين إلا من يشغل حاليًا دورًا في المجلس العام.',
    'system-administrators.not-found': 'لم يعد هذا الشخص مسؤول نظام.',
  },
};

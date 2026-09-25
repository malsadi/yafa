import type { TextShape } from '../text-shape';
import type { handoversText as english } from '../en/handovers';

export const handoversText: TextShape<typeof english> = {
  mine: 'عمليات التسليم التي تشارك فيها',
  noHandovers: 'لا توجد عمليات تسليم.',
  summary: '{role}: من {outgoing} إلى {incoming}',
  statuses: { open: 'مفتوحة', confirming: 'قيد التأكيد', complete: 'مكتملة' },
  setUpHeading: 'إعداد عملية تسليم',
  outgoing: 'عضو اللجنة المغادر',
  incoming: 'عضو اللجنة القادم',
  choosePerson: 'اختر عضو لجنة',
  setUp: 'إعداد عملية التسليم',
  confirmedBy: 'أكّد {name} في {date}',
  notYetConfirmed: 'لم يؤكّد {name} بعد',
  checklist: 'قائمة التسليم',
  noItems: 'قائمة التسليم فارغة.',
  removeItem: 'إزالة {name}',
  addItem: 'إضافة عنصر',
  confirmExplanation:
    'أكّد عملية التسليم كاملة متى اطمأننت إليها. يثبّت التأكيد الأول القائمة، وعندما يؤكّد العضوان تكتمل العملية وتُقفل.',
  confirmChecked: 'راجعتُ قائمة التسليم.',
  confirm: 'تأكيد عملية التسليم',
  refusals: {
    'handovers.checklist-fixed': 'بدأ التأكيد، لذا لم يعد بالإمكان تغيير القائمة.',
    'handovers.already-confirmed': 'لقد أكّدت عملية التسليم هذه بالفعل.',
    'handovers.not-a-participant': 'لا يؤكّد عملية التسليم إلا العضوان المذكوران فيها.',
    'handovers.same-person': 'يجب أن يكون العضو المغادر والعضو القادم شخصين مختلفين.',
    'handovers.not-officers-of-unit':
      'يجب أن يشغل العضوان، أو أن يكونا قد شغلا، فترة عضوية في هذه الوحدة.',
    'handovers.item-not-found': 'لم يعد هذا العنصر موجودًا.',
    'handovers.not-found': 'لم تعد عملية التسليم هذه موجودة.',
    'roles.not-found': 'لا يمكن استخدام هذا الدور في هذه الوحدة.',
    'branches.inactive': 'هذا الفرع غير نشط، لذا سجله للقراءة فقط.',
    'request.invalid': 'تحقّق من الحقول وحاول مرة أخرى.',
  },
};

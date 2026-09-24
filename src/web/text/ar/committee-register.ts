import type { TextShape } from '../text-shape';
import type { committeeRegisterText as english } from '../en/committee-register';

export const committeeRegisterText: TextShape<typeof english> = {
  name: 'سجلّ اللجان',
  capabilities: {
    'committee-register.branches.manage': 'إضافة الفروع أو تعديلها',
    'committee-register.standard-roles.manage': 'إدارة الأدوار القياسية',
    'committee-register.branch-roles.manage': 'إضافة أدوار إضافية للفرع',
    'committee-register.officers.manage': 'إدارة أعضاء اللجان وفترات عضويتهم',
    'committee-register.elections.manage': 'تسجيل الانتخابات',
    'committee-register.elections.confirm': 'اعتماد نتائج الانتخابات',
    'committee-register.handovers.manage': 'إعداد عمليات التسليم',
    'committee-register.register.read': 'الاطلاع على السجل',
  },
};

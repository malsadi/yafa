import type { TextShape } from '../text-shape';
import type { branchRolesText as english } from '../en/branch-roles';

export const branchRolesText: TextShape<typeof english> = {
  standardRoles: 'الأدوار القياسية',
  ownRoles: 'أدوار هذا الفرع الخاصة',
  noOwnRoles: 'ليس لهذا الفرع أدوار خاصة.',
  addRole: 'إضافة دور لهذا الفرع',
  refusals: {
    'setting.not-configured':
      'ينتظر هذا مسؤول البيانات: لم يُضبط ما إذا كان يُسمح للفروع بإضافة أدوار إضافية.',
    'roles.branch-roles-not-allowed': 'لا يُسمح للفروع بإضافة أدوار خاصة بها.',
    'roles.name-taken': 'يوجد دور آخر بهذا الاسم.',
    'roles.not-found': 'لم يعد هذا الدور موجودًا.',
    'branches.inactive': 'هذا الفرع غير نشط، لذا سجله للقراءة فقط.',
    'request.invalid': 'الاسمان مطلوبان.',
  },
};

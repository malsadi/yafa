import type { TextShape } from '../text-shape';
import type { rolesText as english } from '../en/roles';

export const rolesText: TextShape<typeof english> = {
  standardRoles: 'الأدوار القياسية',
  standardRolesIntro:
    'القائمة الوطنية للأدوار التي تستخدمها كل الفروع، ليكون للدور المعنى نفسه في كل مكان. مسؤول السجل الوطني وحده يتولّى صيانتها.',
  noRoles: 'لا توجد أدوار قياسية بعد.',
  addRole: 'إضافة دور قياسي',
  add: 'إضافة الدور',
  designations: 'تعيينات مسؤولي السجل',
  designationsIntro:
    'اختر الدور القياسي المعيَّن لكل مسؤول سجل. من يشغل ذلك الدور يملك صلاحيات السجل الخاصة به.',
  noDesignatedRole: 'لا يوجد دور معيَّن',
  refusals: {
    'roles.name-taken': 'يوجد دور آخر بهذا الاسم.',
    'roles.not-found': 'لم يعد هذا الدور موجودًا.',
    'role-designations.standard-role-not-found': 'لا يمكن تعيين إلا دور قياسي.',
    'role-designations.role-already-designated':
      'هذا الدور يحمل التعيين الآخر بالفعل. يحمل الدور تعيينًا واحدًا على الأكثر.',
    'request.invalid': 'الاسمان مطلوبان.',
  },
};

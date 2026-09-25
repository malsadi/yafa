import type { TextShape } from '../text-shape';
import type { rolesText as english } from '../en/roles';

export const rolesText: TextShape<typeof english> = {
  standardRoles: 'المناصب القياسية',
  standardRolesIntro:
    'القائمة الوطنية للمناصب التي تستخدمها كل الفروع، ليكون للمنصب المعنى نفسه في كل مكان. مسؤول السجل الوطني وحده يتولّى صيانتها.',
  noRoles: 'لا توجد مناصب قياسية بعد.',
  nameEn: 'الاسم بالإنجليزية',
  nameAr: 'الاسم بالعربية',
  rename: 'إعادة التسمية',
  renameRole: 'إعادة تسمية {name}',
  save: 'حفظ',
  cancel: 'إلغاء',
  addRole: 'إضافة منصب قياسي',
  add: 'إضافة المنصب',
  designations: 'تعيينات مسؤولي السجل',
  designationsIntro:
    'اختر المنصب القياسي المعيَّن لكل مسؤول سجل. من يشغل ذلك المنصب يملك صلاحيات السجل الخاصة به.',
  noDesignatedRole: 'لا يوجد منصب معيَّن',
  refusals: {
    'roles.name-taken': 'يوجد منصب آخر بهذا الاسم.',
    'roles.not-found': 'لم يعد هذا المنصب موجودًا.',
    'role-designations.standard-role-not-found': 'لا يمكن تعيين إلا منصب قياسي.',
    'role-designations.role-already-designated':
      'هذا المنصب يحمل التعيين الآخر بالفعل. يحمل المنصب تعيينًا واحدًا على الأكثر.',
    'request.invalid': 'الاسمان مطلوبان.',
  },
};

import type { TextShape } from '../text-shape';
import type { accessCheckText as english } from '../en/access-check';

export const accessCheckText: TextShape<typeof english> = {
  intro:
    'اختر مسؤولًا لترى بالضبط الصلاحيات التي يملكها، وأين، ولماذا. تُعرض الصلاحيات فقط، ولا تُعرض بياناته أبدًا.',
  officer: 'المسؤول',
  chooseOfficer: 'اختر مسؤولًا',
  isSystemAdministrator: 'مسؤول نظام',
  currentTerms: 'المناصب الحالية',
  noCurrentTerms: 'لا توجد مناصب حالية.',
  capabilities: 'الصلاحيات',
  noCapabilities: 'لا توجد صلاحيات.',
  portalWide: 'على مستوى البوابة',
  sources: {
    matrix: 'من مصفوفة الصلاحيات',
    'fixed rule': 'قاعدة ثابتة',
    'system administrator': 'بصفته مسؤول نظام',
  },
};

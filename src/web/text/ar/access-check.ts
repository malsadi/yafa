import type { TextShape } from '../text-shape';
import type { accessCheckText as english } from '../en/access-check';

export const accessCheckText: TextShape<typeof english> = {
  intro:
    'اختر عضو لجنة لترى بالضبط الصلاحيات التي يملكها، وأين، ولماذا. تُعرض الصلاحيات فقط، ولا تُعرض بياناته أبدًا.',
  officer: 'عضو اللجنة',
  chooseOfficer: 'اختر عضو لجنة',
  isSystemAdministrator: 'مسؤول نظام',
  currentTerms: 'فترات العضوية الحالية',
  noCurrentTerms: 'لا توجد فترات عضوية حالية.',
  capabilities: 'الصلاحيات',
  noCapabilities: 'لا توجد صلاحيات.',
  portalWide: 'على مستوى البوابة',
  sources: {
    matrix: 'من مصفوفة الصلاحيات',
    'fixed rule': 'قاعدة ثابتة',
    'system administrator': 'بصفته مسؤول نظام',
  },
};

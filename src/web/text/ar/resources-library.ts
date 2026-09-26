import type { TextShape } from '../text-shape';
import { filedLettersText } from './filed-letters';
import { letterTemplatesText } from './letter-templates';
import type { resourcesLibraryText as english } from '../en/resources-library';

export const resourcesLibraryText: TextShape<typeof english> = {
  name: 'مكتبة الموارد',
  capabilities: {
    'resources-library.library.read': 'الاطلاع على المكتبة',
    'resources-library.resources.manage': 'إدارة النماذج والأدلة',
    'resources-library.venues.manage': 'إدارة الأماكن',
    'resources-library.equipment.manage': 'إدارة المعدات والإعارات',
    'resources-library.letter-templates.manage': 'إدارة قوالب الخطابات',
    'resources-library.correspondence.read': 'الاطلاع على الخطابات الواردة والصادرة',
  },
  sections: {
    label: 'أقسام المكتبة',
    letterTemplates: 'نماذج الرسائل',
    lettersOut: 'الرسائل الصادرة',
    lettersIn: 'الرسائل الواردة',
  },
  letterTemplates: letterTemplatesText,
  filedLetters: filedLettersText,
};

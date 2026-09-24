import type { TextShape } from '../text-shape';
import type { administrationPanelText as english } from '../en/administration-panel';

export const administrationPanelText: TextShape<typeof english> = {
  name: 'لوحة الإدارة',
  stages: {
    'access-and-permissions': 'الوصول والصلاحيات',
    organisation: 'التنظيم',
    configuration: 'الإعدادات',
    operations: 'التشغيل',
  },
};

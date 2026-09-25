import type { TextShape } from '../text-shape';
import type { communicationHubText as english } from '../en/communication-hub';

export const communicationHubText: TextShape<typeof english> = {
  name: 'مركز التواصل',
  settings: {
    'communication-hub.alert_types_for_new_officers':
      'أنواع التنبيهات المفعّلة لأعضاء اللجان الجدد',
  },
  alertTypes: {
    notices: 'الإعلانات الجديدة',
    votes: 'التصويتات',
    circulars: 'التعاميم الوطنية',
    replies: 'الردود',
    requests: 'الطلبات',
  },
};

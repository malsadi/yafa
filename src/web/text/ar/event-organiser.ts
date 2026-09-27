import type { TextShape } from '../text-shape';
import type { eventOrganiserText as english } from '../en/event-organiser';

export const eventOrganiserText: TextShape<typeof english> = {
  name: 'منظّم الفعاليات',
  capabilities: {
    'event-organiser.events.read': 'الاطلاع على الفعاليات',
    'event-organiser.events.create': 'إنشاء الفعاليات',
    'event-organiser.events.approve': 'اعتماد الفعاليات',
    'event-organiser.events.manage': 'إدارة الفعاليات',
    'event-organiser.events.close': 'إغلاق الفعاليات',
    'event-organiser.templates.manage': 'إدارة قوالب الفعاليات',
  },
  settings: {
    'event-organiser.status_may_move_backwards': 'السماح بإرجاع حالة الفعالية إلى الوراء',
    'event-organiser.cancelled_tasks_count_in_progress': 'احتساب المهام الملغاة في نسبة الإنجاز',
  },
};

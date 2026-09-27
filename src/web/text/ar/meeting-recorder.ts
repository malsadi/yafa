import type { TextShape } from '../text-shape';
import type { meetingRecorderText as english } from '../en/meeting-recorder';

export const meetingRecorderText: TextShape<typeof english> = {
  name: 'سجلّ الاجتماعات',
  capabilities: {
    'meeting-recorder.meetings.read': 'الاطلاع على الاجتماعات',
    'meeting-recorder.meetings.manage': 'إدارة الاجتماعات',
  },
  settings: {
    'meeting-recorder.minutes_autosave_seconds': 'فترة الحفظ التلقائي للمحضر (بالثواني)',
  },
  statuses: {
    Scheduled: 'مجدول',
    Held: 'منعقد',
    'Report logged': 'سُجّل التقرير',
    Cancelled: 'ملغى',
  },
  attendance: {
    Present: 'حاضر',
    Apologies: 'معتذر',
    'Did not attend': 'لم يحضر',
  },
  reportPdf: {
    title: 'تقرير الاجتماع: {type}',
    when: 'التاريخ: {date}، {time}',
    place: 'المكان: {place}',
    link: 'عبر الإنترنت: {link}',
    chair: 'الرئيس: {name}',
    secretary: 'أمين السر: {name}',
    attendance: 'الحضور',
    notMarked: 'لم يُحدَّد',
    originalAgenda: 'جدول الأعمال',
    updatedAgenda: 'جدول الأعمال كما حُدّث في الاجتماع',
    raised: '{title} (طُرح في الاجتماع)',
    minutes: 'المحضر',
    vote: 'التصويت: {for} مع، {against} ضد، {abstain} ممتنع. النتيجة: {result}',
    decision: 'القرار: {decision}',
  },
};

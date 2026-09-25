import type { TextShape } from '../text-shape';
import type { listsText as english } from '../en/lists';

export const listsText: TextShape<typeof english> = {
  intro:
    'القوائم التي يختار منها أعضاء اللجان في أنحاء البوابة. لكل عنصر اسم بالإنجليزية والعربية.',
  names: {
    'event-types': 'أنواع الفعاليات',
    'meeting-types': 'أنواع الاجتماعات',
    'achievement-categories': 'فئات الإنجازات',
    'equipment-conditions': 'حالات المعدات',
    'handover-checklist-items': 'عناصر قائمة التسليم',
  },
  empty: 'لا توجد عناصر بعد.',
  add: 'إضافة عنصر',
  archiveCategories: 'فئات الأرشيف',
  archiveCategoriesFixed: 'هذه الفئات ثابتة تحددها البوابة ولا يمكن تغييرها.',
  refusals: {
    'lists.name-taken': 'يوجد عنصر آخر في هذه القائمة بهذا الاسم.',
    'lists.item-not-found': 'لم يعد هذا العنصر موجودًا.',
    'request.invalid': 'الاسمان مطلوبان.',
  },
};

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
    'calendar-colours': 'ألوان التقويم',
  },
  colour: 'اللون',
  retired: 'متوقف',
  save: 'حفظ',
  cancel: 'إلغاء',
  rename: 'إعادة التسمية',
  renameItem: 'إعادة تسمية {name}',
  moveUp: 'أعلى',
  moveDown: 'أسفل',
  moveUpItem: 'نقل {name} إلى الأعلى',
  moveDownItem: 'نقل {name} إلى الأسفل',
  retire: 'إيقاف',
  retireItem: 'إيقاف {name}',
  retireWarning:
    'لن يُعرض بعد الآن للسجلات الجديدة، وتحتفظ به السجلات السابقة. لا يمكن التراجع عن ذلك.',
  confirmRetire: 'إيقاف {name}',
  empty: 'لا توجد عناصر بعد.',
  add: 'إضافة عنصر',
  archiveCategories: 'فئات الأرشيف',
  archiveCategoriesFixed: 'هذه الفئات ثابتة تحددها البوابة ولا يمكن تغييرها.',
  refusals: {
    'lists.name-taken': 'يوجد عنصر آخر في هذه القائمة بهذا الاسم.',
    'lists.item-not-found': 'لم يعد هذا العنصر موجودًا.',
    'lists.item-already-retired': 'هذا العنصر متوقف بالفعل.',
    'lists.order-must-name-every-item':
      'تغيّرت القائمة في هذه الأثناء. أُعيد تحميلها؛ حاول مرة أخرى.',
    'lists.colour-required': 'يحتاج لون التقويم إلى لونه.',
    'lists.colour-only-for-calendar-colours': 'لا يكون اللون إلا للون التقويم.',
    'request.invalid': 'الاسمان مطلوبان، ويُكتب اللون بالصيغة #RRGGBB.',
  },
};

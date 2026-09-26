import type { TextShape } from '../text-shape';
import type { treasuryYearsText as english } from '../en/treasury-years';

export const treasuryYearsText: TextShape<typeof english> = {
  heading: 'السنوات المالية',
  explanation:
    'إقفال السنة يقفل قيودها ويحفظ كشفًا لكل حساب في الأرشيف. تُقفل السنة بعد انتهائها، وبعد السنة التي قبلها، ولا شيء فيها بانتظار الاعتماد.',
  period: 'من {start} إلى {end}',
  closed: 'أقفلها {name} في {date}',
  closedNoName: 'أُقفلت في {date}',
  open: 'مفتوحة',
  notEnded: 'لم تنتهِ بعد',
  awaiting: '{count} بانتظار الاعتماد',
  close: 'إقفال السنة',
  confirm: 'إقفال هذه السنة؟ ستُقفل قيودها نهائيًا.',
};

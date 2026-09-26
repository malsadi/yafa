import type { TextShape } from '../text-shape';
import type { treasuryStatementsText as english } from '../en/treasury-statements';

export const treasuryStatementsText: TextShape<typeof english> = {
  heading: 'كشف الحساب',
  from: 'من',
  to: 'إلى',
  view: 'عرض',
  download: 'تنزيل PDF',
  file: 'حفظ في الأرشيف',
  filed: 'حُفظ في الأرشيف، ضمن المالية.',
  opening: 'الرصيد في البداية: {balance}',
  closing: 'الرصيد في النهاية: {balance}',
  columns: { date: 'التاريخ', details: 'التفاصيل', in: 'وارد', out: 'صادر', balance: 'الرصيد' },
};

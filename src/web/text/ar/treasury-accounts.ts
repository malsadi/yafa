import type { TextShape } from '../text-shape';
import type { treasuryAccountsText as english } from '../en/treasury-accounts';

export const treasuryAccountsText: TextShape<typeof english> = {
  sections: {
    label: 'أقسام الخزينة',
    accounts: 'الحسابات',
    approvals: 'بانتظار الاعتماد',
    years: 'السنوات المالية',
  },
  heading: 'الحسابات',
  none: 'لا توجد حسابات بعد.',
  unitTotal: 'مجموع الحسابات المفتوحة: {total}',
  kinds: { bank: 'بنك', cash: 'نقد', event: 'فعالية' },
  statuses: { Open: 'مفتوح', Closed: 'مغلق' },
  awaiting: '{count} بانتظار الاعتماد',
  belowZero: 'دون الصفر',
  open: 'فتح حساب للفرع',
  name: 'الاسم',
  type: 'بنك أو نقد',
  openingBalance: 'الرصيد الافتتاحي (£، قد يكون سالبًا)',
  openingDate: 'تاريخ الفتح',
  save: 'فتح الحساب',
  cancel: 'إلغاء',
  close: 'إغلاق الحساب',
  closeExplanation:
    'لا يُغلق الحساب إلا عند رصيد صفر ولا شيء بانتظار الاعتماد. يُحتفظ به مع سجله، ولا يُعاد فتحه.',
  amountInvalid: 'اكتب المبلغ بالجنيه، مثل 150 أو -20.50.',
  back: 'العودة إلى الحسابات',
  balance: 'الرصيد: {balance}',
};

import type { TextShape } from '../text-shape';
import type { treasuryText as english } from '../en/treasury';

export const treasuryText: TextShape<typeof english> = {
  name: 'الخزينة',
  capabilities: {
    'treasury.accounts.read': 'الاطلاع على الخزينة',
    'treasury.accounts.manage': 'فتح حسابات الفرع وإغلاقها',
    'treasury.credit.create': 'تسجيل الإيرادات',
    'treasury.debit.create': 'تسجيل المصروفات',
    'treasury.transfer.create': 'تسجيل التحويلات',
    'treasury.debit.approve': 'اعتماد المدفوعات',
    'treasury.entries.correct': 'تصحيح القيود',
    'treasury.statements.file': 'حفظ كشوف الحساب',
    'treasury.year-end.close': 'إقفال السنة المالية',
  },
  settings: {
    'treasury.approval_threshold': 'حد الاعتماد',
    'treasury.financial_year_start': 'بداية السنة المالية',
    'treasury.receipt_required': 'الإيصال مطلوب',
  },
};

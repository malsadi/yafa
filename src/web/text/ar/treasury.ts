import type { TextShape } from '../text-shape';
import { treasuryAccountsText } from './treasury-accounts';
import { treasuryApprovalsText } from './treasury-approvals';
import { treasuryEntriesText } from './treasury-entries';
import { treasuryRefusalsText } from './treasury-refusals';
import { treasuryStatementsText } from './treasury-statements';
import { treasuryYearsText } from './treasury-years';
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
  statementPdf: {
    title: 'كشف حساب: {account}',
    period: 'من {from} إلى {to}',
    headings: { date: 'التاريخ', details: 'التفاصيل', in: 'وارد', out: 'صادر', balance: 'الرصيد' },
    opening: 'الرصيد في بداية الفترة',
    closing: 'الرصيد في نهاية الفترة',
    types: {
      'opening-balance': 'رصيد افتتاحي',
      credit: 'إيراد',
      debit: 'مصروف',
      transferIn: 'تحويل من {account}',
      transferOut: 'تحويل إلى {account}',
    },
    reversal: '{type} (قيد عكسي)',
  },
  accounts: treasuryAccountsText,
  entries: treasuryEntriesText,
  approvals: treasuryApprovalsText,
  statements: treasuryStatementsText,
  years: treasuryYearsText,
  refusals: treasuryRefusalsText,
};

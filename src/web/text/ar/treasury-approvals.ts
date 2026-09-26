import type { TextShape } from '../text-shape';
import type { treasuryApprovalsText as english } from '../en/treasury-approvals';

export const treasuryApprovalsText: TextShape<typeof english> = {
  heading: 'بانتظار الاعتماد',
  explanation: 'تنتظر المصروفات والتحويلات التي تتجاوز الحد هنا حتى يعتمدها مسؤول آخر أو يرفضها.',
  none: 'لا شيء بانتظار الاعتماد.',
  yours: 'أنت سجّلت هذا، لذا يقرره مسؤول آخر.',
  approve: 'اعتماد',
  decline: 'رفض',
  reason: 'سبب الرفض',
  confirmDecline: 'رفض',
};

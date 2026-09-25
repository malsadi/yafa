import type { TextShape } from '../text-shape';
import type { officerAccountsText as english } from '../en/officer-accounts';

export const officerAccountsText: TextShape<typeof english> = {
  intro: 'كل شخص في السجل مع حالة وصوله. تُعدَّل بيانات السجل في سجلّ اللجان.',
  noPeople: 'لا يوجد أحد في السجل بعد.',
  lastInvited: 'آخر دعوة في {date}',
  states: {
    'Not invited': 'لم تُرسل دعوة',
    Invited: 'مدعو',
    Active: 'نشط',
    'Not linked': 'غير مرتبط',
    Locked: 'مقفل',
  },
  actions: {
    invitation: 'إعادة إرسال الدعوة',
    lock: 'قفل',
    unlock: 'فتح القفل',
    'sign-out': 'تسجيل الخروج من كل الجلسات',
    'remove-push-devices': 'إزالة أجهزة الإشعارات',
  },
  actionFor: {
    invitation: 'إعادة إرسال الدعوة إلى {name}',
    lock: 'قفل حساب {name}',
    unlock: 'فتح قفل حساب {name}',
    'sign-out': 'تسجيل خروج {name} من كل الجلسات',
    'remove-push-devices': 'إزالة أجهزة الإشعارات الخاصة بـ {name}',
  },
  done: {
    invitation: 'أُرسلت الدعوة.',
    lock: 'قُفل الحساب.',
    unlock: 'فُتح قفل الحساب.',
    'sign-out': 'سُجّل الخروج من كل الجلسات.',
    'remove-push-devices': 'أُزيلت أجهزة الإشعارات.',
  },
  invitationFailed: 'تعذّر إرسال الدعوة. حاول لاحقًا.',
  refusals: {
    'officer-accounts.not-found': 'لم يعد هذا الشخص في السجل.',
    'officer-accounts.already-has-account': 'لدى هذا الشخص حساب بالفعل.',
    'officer-accounts.no-account': 'ليس لدى هذا الشخص حساب.',
    'officer-accounts.already-locked': 'هذا الحساب مقفل بالفعل.',
    'officer-accounts.not-locked': 'هذا الحساب غير مقفل.',
    'clerk.unavailable': 'تعذّر الوصول إلى خدمة تسجيل الدخول. حاول لاحقًا.',
  },
};

import type { TextShape } from '../text-shape';
import type { filedLettersText as english } from '../en/filed-letters';

export const filedLettersText: TextShape<typeof english> = {
  headings: { out: 'الرسائل الصادرة', in: 'الرسائل الواردة' },
  explanation: {
    out: 'نسخة PDF من كل رسالة مرسلة، تُحفظ تلقائيًا تحت رقمها المرجعي.',
    in: 'صورة أو مسح ضوئي لكل رسالة واردة، تُحفظ تلقائيًا تحت رقمها المرجعي.',
  },
  none: 'لا توجد رسائل بعد.',
  filedOn: '{reference}، حُفظت في {date}',
  download: 'تنزيل',
  refusals: {
    'permission.denied': 'لا يحق لك الاطلاع على رسائل هذه الوحدة.',
    'resources-library.letter-not-found': 'هذه الرسالة غير موجودة.',
    'files.storage-not-configured': 'لم يُجهَّز تخزين الملفات بعد.',
    'setting.not-configured': 'لم يتم إعداد هذا بعد. يرجى التواصل مع المسؤول.',
  },
};

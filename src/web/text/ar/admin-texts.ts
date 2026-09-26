import type { TextShape } from '../text-shape';
import type { adminTextsText as english } from '../en/admin-texts';

export const adminTextsText: TextShape<typeof english> = {
  english: 'بالإنجليزية',
  arabic: 'بالعربية',
  arabicMissing: 'لم يُكتب النص العربي بعد. وحتى يُكتب، يرى من يقرأ بالعربية النص الإنجليزي.',
  save: 'حفظ',
  names: {
    'iphone-install-guide': 'دليل التثبيت على آيفون',
    'access-not-active': 'رسالة «الوصول غير نشط»',
    help: 'نص المساعدة',
  },
};

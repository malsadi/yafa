import type { TextShape } from '../text-shape';
import type { brandingText as english } from '../en/branding';

export const brandingText: TextShape<typeof english> = {
  intro:
    'اسم المنظمة، واللونان الرئيسي ولون التمييز المستخدمان للعناوين والخطوط والتمييز في البوابة ومستنداتها. يبقى النص أسود على أبيض.',
  nameEn: 'اسم المنظمة بالإنجليزية',
  nameAr: 'اسم المنظمة بالعربية',
  mainColour: 'اللون الرئيسي',
  accentColour: 'لون التمييز',
  sampleHeading: 'عنوان',
  contrastOk: '{ratio}:1 مقابل الأبيض: مقروء',
  contrastTooLow: '{ratio}:1 مقابل الأبيض: باهت جدًا للقراءة (يلزم 4.5:1)',
  save: 'حفظ',
  refusals: {
    'request.invalid':
      'تحقّق مما أدخلته: الاسم الإنجليزي مطلوب، ويجب أن يكون كل لون مقروءًا على الأبيض.',
  },
};

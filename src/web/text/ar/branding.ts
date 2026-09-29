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
  pickColour: 'اختر {colour}',
  colourFormat: 'اكتبه بالعلامة # وستة أحرف أو أرقام، مثل #1D4ED8.',
  saveNeedsColours: 'يصبح الحفظ متاحًا بعد تحديد اللونين وأن يكونا واضحين على الخلفية البيضاء.',
  save: 'حفظ',
  logoPosition: 'موضع الشعار في الترويسة',
  logoPositionHint: 'في الخطابات العربية ينعكس الموضع: يصبح اليسار بداية السطر.',
  positions: { left: 'يسار', centre: 'وسط', right: 'يمين' },
  letterhead: 'الترويسة',
  previewIn: { en: 'بالإنجليزية', ar: 'بالعربية' },
  previewPdf: 'معاينة PDF',
  sample: {
    paragraphs:
      'الزميل العزيز،\n\nهكذا يبدو خطاب صادر من البوابة على الترويسة.\n\nمع أطيب التحيات،',
    signer: { name: 'عضو اللجنة الموقِّع', role: 'دوره', unit: 'وحدته' },
  },
  refusals: {
    'permission.denied': 'لا يحق لك تغيير الهوية والترويسة.',
    'pdf.not-available': 'معاينات PDF غير متاحة هنا. تعمل في موقع المعاينة.',
    'branding.no-national-unit': 'وحدة المجلس العام غير موجودة بعد.',
    'request.invalid':
      'تحقّق مما أدخلته: الاسم الإنجليزي مطلوب، ويجب أن يكون كل لون مقروءًا على الأبيض.',
  },
};

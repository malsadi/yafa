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
  files: 'الملفات',
  uploaded: 'مرفوع',
  notUploaded: 'لم يُرفع بعد',
  logo: 'الشعار',
  logoHint: 'ملف PNG كما يجب أن يظهر في الترويسة.',
  icon: 'الأيقونة المربعة',
  iconHint: 'ملف PNG مربع، 512 بكسل على الأقل. يصبح أيقونة البوابة على الشاشة الرئيسية للهواتف.',
  latinFont: 'الخط اللاتيني',
  arabicFont: 'الخط العربي',
  fontHint: 'ملف خط (.woff2 أو .ttf أو .otf)، يُستخدم في الشاشات والمستندات.',
  logoPosition: 'موضع الشعار في الترويسة',
  logoPositionHint: 'في الخطابات العربية ينعكس الموضع: يصبح اليسار بداية السطر.',
  positions: { left: 'يسار', centre: 'وسط', right: 'يمين' },
  letterhead: 'الترويسة',
  previewIn: { en: 'بالإنجليزية', ar: 'بالعربية' },
  previewPdf: 'معاينة PDF',
  sample: {
    logo: 'الشعار',
    paragraphs:
      'الزميل العزيز،\n\nهكذا يبدو خطاب صادر من البوابة على الترويسة.\n\nمع أطيب التحيات،',
    signer: { name: 'عضو اللجنة الموقِّع', role: 'دوره', unit: 'وحدته' },
  },
  refusals: {
    'pdf.not-available': 'معاينات PDF غير متاحة هنا. تعمل في موقع المعاينة.',
    'branding.icon-not-square': 'يجب أن تكون الأيقونة صورة مربعة.',
    'files.type-not-allowed': 'نوع هذا الملف غير مسموح به هنا. راجع إعدادات الملفات.',
    'files.too-large': 'هذا الملف أكبر من حده. راجع إعدادات الملفات.',
    'files.storage-not-configured': 'لم يُجهَّز تخزين الملفات بعد.',
    'files.upload-failed': 'لم يكتمل الرفع. حاول مرة أخرى.',
    'setting.not-configured': 'ينتظر هذا ضبط إعدادات الملفات.',
    'branding.no-national-unit': 'وحدة المجلس العام غير موجودة بعد.',
    'request.invalid':
      'تحقّق مما أدخلته: الاسم الإنجليزي مطلوب، ويجب أن يكون كل لون مقروءًا على الأبيض.',
  },
};

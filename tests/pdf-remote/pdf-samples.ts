import type { Language } from '../../src/shared/core/languages';

// Fictional sample content for the core/pdf check (T-072): Latin text with
// a pound amount; Arabic text that needs joining and the lam-alef ligature,
// Arabic-Indic and Western digits, and a Latin word inside a right-to-left
// line (the bidirectional case letters and reports will hit).
export const SAMPLE_BODIES: Record<Language, string> = {
  en: `<h1>Sample document</h1>
<p>This fictional sample checks English text, set left to right in the embedded Latin font.</p>
<p>Amount: £1,234.56 — Date: 19 September 2026</p>`,
  ar: `<h1>مستند تجريبي</h1>
<p>السلام عليكم. هذا مستند تجريبي للتحقق من تشكيل الحروف العربية واتجاه النص من اليمين إلى اليسار.</p>
<p>لا إله إلا الله — كلمة لاتينية داخل السطر: Yafa Council</p>
<p>المبلغ: ١٬٢٣٤٫٥٦ جنيه — التاريخ: 19 سبتمبر 2026</p>`,
};

export const SAMPLE_CSS = `
body { margin: 0; font-size: 14pt; line-height: 1.6; }
html[lang="en"] body { font-family: 'Noto Sans'; }
html[lang="ar"] body { font-family: 'Noto Naskh Arabic', 'Noto Sans'; }
h1 { font-size: 20pt; }
`;

import { renderPdf, type PdfFont } from '../../src/worker/core/pdf';
import notoNaskhArabic from '../fixtures/fonts/noto-naskh-arabic.ttf';
import notoSans from '../fixtures/fonts/noto-sans.ttf';
import { SAMPLE_BODIES, SAMPLE_CSS } from './pdf-samples';

// Test fixtures only (T-072): in the portal the fonts come from branding.
const FONTS: PdfFont[] = [
  { family: 'Noto Sans', data: notoSans, format: 'truetype' },
  { family: 'Noto Naskh Arabic', data: notoNaskhArabic, format: 'truetype' },
];

export default {
  async fetch(request, env) {
    const language = new URL(request.url).searchParams.get('language') === 'ar' ? 'ar' : 'en';
    const pdf = await renderPdf(
      env.BROWSER,
      { bodyHtml: SAMPLE_BODIES[language], css: SAMPLE_CSS, language, fonts: FONTS },
      { format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } },
    );
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
  },
} satisfies ExportedHandler<{ BROWSER: Fetcher }>;

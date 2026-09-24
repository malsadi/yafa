/**
 * One font a PDF may use. Fonts are always passed in, never chosen here:
 * the Latin and Arabic fonts are a branding setting (brief section 15 C3),
 * served from the portal's own storage, never an outside service (brief
 * section 8.5). `data` is the font file itself.
 */
export interface PdfFont {
  family: string;
  data: ArrayBuffer;
  format: 'truetype' | 'opentype' | 'woff2';
  weight?: string;
  style?: 'normal' | 'italic';
}

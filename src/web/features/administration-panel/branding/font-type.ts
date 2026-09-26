// Browsers often send no type for a font file, so it is read from its extension.
const FONT_TYPES: Record<string, string> = {
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

/** The file's type as sent, or a font's from its extension. */
export function fileTypeOf(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return file.type || (FONT_TYPES[extension] ?? '');
}

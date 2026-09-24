export type PageLanguage = 'en' | 'ar';

export interface Bilingual {
  en: string;
  ar: string;
}

/** "English || Arabic" → both halves (D-058); both are required. */
export function splitBilingual(line: string, where: string): Bilingual {
  const parts = line.split(' || ');
  const [en, ar] = parts.map((part) => part.trim());
  if (parts.length !== 2 || !en || !ar) {
    throw new Error(`${where} needs "English || Arabic": ${line}`);
  }
  return { en, ar };
}

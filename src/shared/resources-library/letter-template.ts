import type { Language } from '../core/languages';

/** Brief 16 D1 and P19: a standard letter, as the library lists it. */
export interface LetterTemplateRecord {
  id: string;
  unitId: string;
  /** A national template, the General Council's, is shared with every branch (7.3). */
  national: boolean;
  title: string;
  /** D-112: optional; with none, the letter begins at its text. */
  subject: string | null;
  body: string;
  /** D-101: the fields the author named, in order. */
  fields: string[];
  language: Language;
  retiredAt: string | null;
  /** 9.1: sent back with a save, so a stale one is refused. */
  version: number;
}

/** The unit a template's letterhead preview is shown for (D-102). */
export interface LetterheadUnit {
  nameEn: string;
  nameAr: string;
  addressEn: string | null;
  addressAr: string | null;
}

export interface LetterTemplatesView {
  templates: LetterTemplateRecord[];
  letterheadUnit: LetterheadUnit;
}

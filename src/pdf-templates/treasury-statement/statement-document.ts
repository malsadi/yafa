import type { Language } from '../../shared/core/languages';

/**
 * Brief 17 C2 and 9.4: a statement as it is printed — every value already
 * written in the officer's language (dates, money), with the labels.
 */
export interface StatementDocument {
  language: Language;
  organisationName: string;
  unitName: string;
  title: string;
  period: string;
  headings: { date: string; details: string; in: string; out: string; balance: string };
  opening: { label: string; balance: string };
  rows: { date: string; details: string; in: string; out: string; balance: string }[];
  closing: { label: string; balance: string };
}

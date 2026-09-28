import type { Language } from '../../shared/core/languages';

/**
 * Brief 24 B2, 9.4 and D-215 (O-158): the annual report as printed — every
 * value already written in the finalising officer's language: a heading,
 * and each section as its lines.
 */
export interface AnnualReportDocument {
  language: Language;
  organisationName: string;
  unitName: string;
  title: string;
  details: string[];
  sections: { heading: string; lines: string[] }[];
}

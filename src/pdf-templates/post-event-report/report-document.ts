import type { Language } from '../../shared/core/languages';

/**
 * Brief 21 C1, 9.4 and D-183: the post-event report as it is printed —
 * every value already written in the closing officer's language, with the
 * labels; a cancelled event's is headed as cancelled (D-181).
 */
export interface ReportDocument {
  language: Language;
  organisationName: string;
  unitName: string;
  title: string;
  details: string[];
  tasks: {
    heading: string;
    summary: string;
    headings: { task: string; status: string };
    rows: { task: string; status: string }[];
  };
  budget: {
    heading: string;
    headings: { line: string; budget: string; income: string; spending: string };
    rows: { line: string; budget: string; income: string; spending: string }[];
    totals: { line: string; budget: string; income: string; spending: string };
    balance: { label: string; amount: string };
  };
}

/** Brief 24 B2: an annual report is a draft until it is finalised and locked. */
export const ANNUAL_REPORT_STATUSES = ['Draft', 'Finalised'] as const;

export type AnnualReportStatus = (typeof ANNUAL_REPORT_STATUSES)[number];

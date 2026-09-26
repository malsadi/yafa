/** Brief 15: one archived document as a search lists it. */
export interface ArchiveDocumentSummary {
  id: string;
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  categoryId: string;
  source: 'automatic' | 'upload';
  title: string;
  description: string | null;
  /** The document's own date, `YYYY-MM-DD` (D-097). */
  documentDate: string;
  /** When it was filed, an ISO timestamp (D-097). */
  filedAt: string;
  filedByName: string | null;
  latestVersion: number;
}

/** Brief 15 A4: one version of a document. */
export interface ArchiveDocumentVersion {
  version: number;
  fileName: string;
  size: number;
  addedByName: string | null;
  createdAt: string;
}

export interface ArchiveDocumentDetail extends ArchiveDocumentSummary {
  versions: ArchiveDocumentVersion[];
}

/** Brief 15 A3: a category, fixed by the brief (8.2). */
export interface ArchiveCategory {
  id: string;
  nameEn: string;
  nameAr: string;
}

/** Brief 15 B1: a unit whose documents the officer sees. */
export interface ArchiveUnit {
  id: string;
  nameEn: string;
  nameAr: string;
}

/** Brief 15 B1 (D-097): which date a search looks at. */
export const ARCHIVE_DATE_FIELDS = ['document', 'filed'] as const;
export type ArchiveDateField = (typeof ARCHIVE_DATE_FIELDS)[number];

/** D-096: the only categories an officer uploads into. The rest are for automatic filings. */
export const ARCHIVE_UPLOAD_CATEGORIES = ['governance', 'general'] as const;

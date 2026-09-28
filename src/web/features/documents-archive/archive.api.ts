import type { Page } from '../../../shared/core/page';
import type {
  ArchiveCategory,
  ArchiveDocumentDetail,
  ArchiveDocumentSummary,
  ArchiveUnit,
} from '../../../shared/documents-archive/archive-document';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const ARCHIVE = '/api/documents-archive';

/** Brief 15 B1 (D-097): each field left empty means "any". */
export interface ArchiveSearchFields {
  title: string;
  categoryId: string;
  unitId: string;
  dateField: '' | 'document' | 'filed';
  from: string;
  to: string;
}

export const EMPTY_SEARCH: ArchiveSearchFields = {
  title: '',
  categoryId: '',
  unitId: '',
  dateField: '',
  from: '',
  to: '',
};

export function searchArchive(request: Request, search: ArchiveSearchFields, page: number) {
  const query = new URLSearchParams([
    ...Object.entries(search).filter(([, value]) => value !== ''),
    ['page', String(page)],
  ]).toString();
  return request<Page<ArchiveDocumentSummary>>(`${ARCHIVE}/documents?${query}`);
}

export function fetchArchiveDocument(request: Request, documentId: string) {
  return request<ArchiveDocumentDetail>(`${ARCHIVE}/documents/${documentId}`);
}

export function fetchArchiveCategories(request: Request) {
  return request<ArchiveCategory[]>(`${ARCHIVE}/categories`);
}

export function fetchArchiveUnits(request: Request) {
  return request<ArchiveUnit[]>(`${ARCHIVE}/units`);
}

export function versionFilePath(documentId: string, version: number) {
  return `${ARCHIVE}/documents/${documentId}/versions/${String(version)}/file`;
}

import type {
  ArchiveCategory,
  ArchiveDocumentDetail,
  ArchiveDocumentSummary,
  ArchiveUnit,
} from '../../../../shared/documents-archive/archive-document';
import { NotFoundError } from '../../../core/errors';
import { findFile, serveFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { listUnits } from '../../committee-register';
import { archiveVisibilityOf, sees } from './archive-visibility';
import {
  findDocument,
  findVersionFileId,
  listCategories,
  listVersions,
  searchDocuments,
} from './finding.repo';
import type { ArchiveSearch } from './finding.schema';

/** Brief 15 B1: the documents this officer may see that match the search. */
export async function searchArchive(
  db: D1Database,
  ctx: RequestContext,
  search: ArchiveSearch,
): Promise<ArchiveDocumentSummary[]> {
  return searchDocuments(db, await archiveVisibilityOf(db, ctx), search);
}

/** A document this officer may see, or not found — never a hint that it exists. */
async function requireVisibleDocument(
  db: D1Database,
  ctx: RequestContext,
  documentId: string,
): Promise<ArchiveDocumentSummary> {
  const visibility = await archiveVisibilityOf(db, ctx);
  const document = await findDocument(db, documentId);
  if (!document || !sees(visibility, document.unitId)) {
    throw new NotFoundError('documents-archive.not-found');
  }
  return document;
}

/** Brief 15 A4: a document and all its versions. */
export async function openDocument(
  db: D1Database,
  ctx: RequestContext,
  documentId: string,
): Promise<ArchiveDocumentDetail> {
  const document = await requireVisibleDocument(db, ctx, documentId);
  return { ...document, versions: await listVersions(db, documentId) };
}

/** Brief 15 B2: download any version of a document the officer may see. */
export async function downloadVersion(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { documentId: string; version: number },
): Promise<Response> {
  await requireVisibleDocument(db, ctx, params.documentId);
  const fileId = await findVersionFileId(db, params.documentId, params.version);
  const file = fileId ? await findFile(db, fileId) : null;
  if (!file) throw new NotFoundError('documents-archive.not-found');
  return serveFile(db, storage, file);
}

/** Brief 15 A3: the categories, for anyone who may read the archive. */
export async function listArchiveCategories(
  db: D1Database,
  ctx: RequestContext,
): Promise<ArchiveCategory[]> {
  await archiveVisibilityOf(db, ctx);
  return listCategories(db);
}

/** Brief 15 B1: the units whose documents this officer sees, to search by branch. */
export async function listArchiveUnits(
  db: D1Database,
  ctx: RequestContext,
): Promise<ArchiveUnit[]> {
  const visibility = await archiveVisibilityOf(db, ctx);
  return (await listUnits(db))
    .filter((unit) => sees(visibility, unit.id))
    .map((unit) => ({ id: unit.id, nameEn: unit.nameEn, nameAr: unit.nameAr }));
}

import type {
  FiledLetterRecord,
  LetterDirection,
} from '../../../../shared/resources-library/filed-letter';
import { NotFoundError } from '../../../core/errors';
import { findFile, serveFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { requireLibraryCapability } from '../library-access';
import { findFiledLetterFileId, listFiledLetters } from './correspondence.repo';

// 7.3: letters in and out are visible to their own branch only, whoever asks.
const READ = 'resources-library.correspondence.read';

/** Brief 16 D2, D3: a unit's letters out or in, read-only. */
export async function listUnitLetters(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; direction: LetterDirection },
): Promise<FiledLetterRecord[]> {
  await requireLibraryCapability(db, ctx, READ, params.unitId);
  return listFiledLetters(db, params.direction, params.unitId);
}

/** Brief 16 D2, D3 and 9.3: download one of the unit's filed letters. */
export async function downloadUnitLetter(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; direction: LetterDirection; letterId: string },
): Promise<Response> {
  await requireLibraryCapability(db, ctx, READ, params.unitId);
  const fileId = await findFiledLetterFileId(db, params.direction, params);
  const file = fileId ? await findFile(db, fileId) : null;
  if (!file) throw new NotFoundError('resources-library.letter-not-found');
  return serveFile(db, storage, file);
}

import type {
  LetterOutDetail,
  LetterOutSummary,
} from '../../../../shared/correspondence-and-letters/letter-records';
import type { Page } from '../../../../shared/core/page';
import { NotFoundError } from '../../../core/errors';
import { pagedQuery } from '../../../core/pagination';
import { findFile, serveFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { exchangeOf } from '../exchange/exchange.repo';
import { READ, requireLetterCapability } from '../letter-access';
import { withoutFileId } from '../without-file-id';
import { findLetterOut, lettersOutQuery } from './letters-out.repo';

interface LetterRef {
  unitId: string;
  letterId: string;
}

/** Brief 23 B2 and 7.3: the unit's letters out register, to its own officers only. */
export async function lettersOut(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; page: number },
): Promise<Page<LetterOutSummary>> {
  await requireLetterCapability(db, ctx, READ, params.unitId);
  return pagedQuery<LetterOutSummary>(db, lettersOutQuery(params.unitId), params.page);
}

async function requireLetterOut(db: D1Database, ctx: RequestContext, params: LetterRef) {
  await requireLetterCapability(db, ctx, READ, params.unitId);
  const found = await findLetterOut(db, params.unitId, params.letterId);
  if (!found) throw new NotFoundError('correspondence-and-letters.letter-not-found');
  return found;
}

/** One letter out, with its whole exchange (O-146). */
export async function letterOut(
  db: D1Database,
  ctx: RequestContext,
  params: LetterRef,
): Promise<LetterOutDetail> {
  const letter = withoutFileId(await requireLetterOut(db, ctx, params));
  return {
    ...letter,
    exchange: await exchangeOf(db, params.unitId, { direction: 'out', id: letter.id }),
  };
}

/** Brief 23 B2: the letter's PDF, as filed. */
export async function downloadLetterOut(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: LetterRef,
): Promise<Response> {
  const found = await requireLetterOut(db, ctx, params);
  const file = await findFile(db, found.fileId);
  if (!file) throw new NotFoundError('correspondence-and-letters.letter-not-found');
  return serveFile(db, storage, file);
}

import type {
  LetterInDetail,
  LetterInSummary,
  RecordingChoices,
} from '../../../../shared/correspondence-and-letters/letter-records';
import type { Page } from '../../../../shared/core/page';
import { NotFoundError } from '../../../core/errors';
import { pagedQuery } from '../../../core/pagination';
import { findFile, serveFile, type FileStorage } from '../../../core/files';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listCurrentOfficersOf } from '../../committee-register';
import { exchangeOf } from '../exchange/exchange.repo';
import { READ, RECORD, requireLetterCapability } from '../letter-access';
import { listLettersOut } from '../letters-out/letters-out.repo';
import { requireLetterInFor } from './letter-in-access';
import { lettersInQuery } from './letters-in.repo';
import { withoutFileId } from '../without-file-id';

interface LetterRef {
  unitId: string;
  letterId: string;
}

/** Brief 23 B3 and 7.3: the unit's letters in register, to its own officers only. */
export async function lettersIn(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; page: number },
): Promise<Page<LetterInSummary>> {
  await requireLetterCapability(db, ctx, READ, params.unitId);
  return pagedQuery<LetterInSummary>(db, lettersInQuery(params.unitId), params.page);
}

/** One letter in, with its whole exchange (O-146) — for readers and its handling officer. */
export async function letterIn(
  db: D1Database,
  ctx: RequestContext,
  params: LetterRef,
): Promise<LetterInDetail> {
  const { letter } = await requireLetterInFor(db, ctx, {
    ...params,
    capability: READ,
    handlerMay: true,
  });
  return {
    ...withoutFileId(letter),
    exchange: await exchangeOf(db, params.unitId, { direction: 'in', id: letter.id }),
  };
}

/** Brief 23 B3: the letter's scan or photo, as filed. */
export async function downloadLetterIn(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: LetterRef,
): Promise<Response> {
  const { letter } = await requireLetterInFor(db, ctx, {
    ...params,
    capability: READ,
    handlerMay: true,
  });
  const file = await findFile(db, letter.fileId);
  if (!file) throw new NotFoundError('correspondence-and-letters.letter-not-found');
  return serveFile(db, storage, file);
}

/** O-143 and O-146: who can handle a letter, and the letters out it may answer. */
export async function recordingChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<RecordingChoices> {
  const unit = await requireLetterCapability(db, ctx, RECORD, unitId);
  const [officers, lettersOut] = await Promise.all([
    listCurrentOfficersOf(db, unit.id, getTodayInLondon()),
    listLettersOut(db, unit.id),
  ]);
  return {
    officers,
    lettersOut: lettersOut.map(({ id, referenceNumber, recipientName, subject }) => ({
      id,
      referenceNumber,
      recipientName,
      subject,
    })),
  };
}

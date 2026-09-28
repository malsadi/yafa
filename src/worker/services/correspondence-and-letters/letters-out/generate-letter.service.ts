import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import { storeGeneratedFile, type FileStorage } from '../../../core/files';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { readBranding } from '../../administration-panel';
import { fileLetter } from '../../resources-library';
import {
  requireLetterCapability,
  requireWritable,
  runLetterBatch,
  WRITE,
  type LetterUnitRow,
} from '../letter-access';
import {
  predictNumber,
  takeNumberStatements,
  withFreshNumber,
  type PredictedNumber,
} from '../numbering/letter-numbers';
import { letterOutDocument, type WrittenLetter } from './letter-out-document';
import type { LetterRenderer } from './letter-renderer';
import { answerableLetterIn } from '../letters-in/letters-in.repo';
import { requireFilledFields, requireSigner, requireUsableTemplate } from './letter-writing';
import {
  buildInsertLetterOutStatement,
  buildMarkRepliedStatement,
  type LetterOutRow,
} from './letters-out.repo';
import type { GenerateLetter } from './letters-out.schema';

interface Deps {
  storage: FileStorage;
  render: LetterRenderer;
}

type Prepared = Omit<WrittenLetter, 'reference' | 'signer'> & {
  signer: WrittenLetter['signer'] & { roleId: string };
  input: GenerateLetter;
  unit: LetterUnitRow;
};

/** Everything the letter needs before its number: checked once, whatever number it gets. */
async function prepare(
  db: D1Database,
  ctx: RequestContext,
  params: GenerateLetter & { unitId: string },
): Promise<Prepared> {
  const unit = await requireLetterCapability(db, ctx, WRITE, params.unitId);
  requireWritable(unit);
  const template = await requireUsableTemplate(db, unit.id, params.templateId);
  if (
    params.replyToLetterInId &&
    !(await answerableLetterIn(db, unit.id, params.replyToLetterInId))
  )
    throw new ConflictError('correspondence-and-letters.not-answerable');
  const signer = await requireSigner(db, ctx, { unitId: unit.id, roleId: params.signerRoleId });
  return {
    input: params,
    unit,
    template,
    fieldValues: requireFilledFields(template, params.fieldValues),
    recipientName: params.recipientName,
    recipientAddress: params.recipientAddress,
    letterDate: getTodayInLondon(),
    signer,
  };
}

/** Brief 23 B2: the register entry for the letter, carrying the number it was printed with. */
function letterRow(
  p: Prepared,
  q: { id: string; next: PredictedNumber; fileId: string; actor: string; at: string },
): LetterOutRow {
  return {
    id: q.id,
    unitId: p.unit.id,
    referenceNumber: q.next.reference,
    sequenceYear: q.next.year,
    sequenceNumber: q.next.number,
    letterDate: p.letterDate,
    templateId: p.template.id,
    language: p.template.language,
    recipientName: p.recipientName,
    recipientAddress: p.recipientAddress,
    subject: p.input.subject,
    fieldValues: p.fieldValues,
    signerPersonId: q.actor,
    signerRoleId: p.signer.roleId,
    replyToLetterInId: p.input.replyToLetterInId,
    fileId: q.fileId,
    createdAt: q.at,
  };
}

/** One try at a number: the PDF to R2 first, then the one batch (brief 10.1 "Letter generated"). */
async function attempt(db: D1Database, ctx: RequestContext, deps: Deps, p: Prepared) {
  const next = await predictNumber(db, p.unit, 'out');
  const pdf = await deps.render(
    letterOutDocument({ ...p, reference: next.reference }, p.unit, await readBranding(db)),
  );
  const id = generateId();
  const { file, statement } = await storeGeneratedFile(deps.storage.bucket, db, {
    unitId: p.unit.id,
    unitCode: p.unit.code,
    service: 'correspondence-and-letters',
    recordId: id,
    use: 'documents',
    fileName: `${next.reference.replace(/[^\p{L}\p{N}-]+/gu, '-')}.pdf`,
    contentType: 'application/pdf',
    body: pdf,
    createdBy: ctx.personId,
    locked: true,
  });
  const at = new Date().toISOString();
  const reply = p.input.replyToLetterInId;
  await runLetterBatch(db, [
    statement,
    ...takeNumberStatements(db, p.unit.id, 'out', next.year),
    buildInsertLetterOutStatement(
      db,
      letterRow(p, { id, next, fileId: file.id, actor: ctx.personId, at }),
    ),
    ...(reply
      ? [buildMarkRepliedStatement(db, { letterInId: reply, actor: ctx.personId, at })]
      : []),
    fileLetter(db, 'out', { file, referenceNumber: next.reference, letterId: id }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'letter-out.generated',
      entityType: 'letter-out',
      entityId: id,
      after: {
        referenceNumber: next.reference,
        templateId: p.template.id,
        replyToLetterInId: reply,
      },
    }),
  ]);
  return { id, referenceNumber: next.reference };
}

/**
 * Brief 23 A2, B1, B2, B4 and D-214: generates a letter — numbered, on the
 * letterhead, signed by the writer — files its PDF under Letters out, and
 * marks the letter it answers Replied, all in one batch after R2. If
 * another letter takes its number first, it is made again with the next.
 */
export async function generateLetter(
  db: D1Database,
  ctx: RequestContext,
  deps: Deps,
  params: GenerateLetter & { unitId: string },
): Promise<{ id: string; referenceNumber: string }> {
  const prepared = await prepare(db, ctx, params);
  return withFreshNumber(() => attempt(db, ctx, deps, prepared));
}

import { NotFoundError } from '../../../core/errors';
import { findFile, serveFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { requireMeetingCapability } from '../meeting-access';
import { requireUnitMeeting } from '../meetings/meeting-guards';
import { READ } from '../meetings/meetings.service';

/** Brief 22 C1: the logged report's PDF, for those who see the meeting. */
export async function downloadMeetingReport(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; meetingId: string },
): Promise<Response> {
  await requireMeetingCapability(db, ctx, READ, params.unitId);
  await requireUnitMeeting(db, params.unitId, params.meetingId);
  const row = await db
    .prepare('SELECT report_file_id AS fileId FROM meetings WHERE id = ?')
    .bind(params.meetingId)
    .first<{ fileId: string | null }>();
  const file = row?.fileId ? await findFile(db, row.fileId) : null;
  if (!file) throw new NotFoundError('meeting-recorder.report-not-logged');
  return serveFile(db, storage, file);
}

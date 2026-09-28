import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { EventFileRecord } from '../../../src/shared/event-organiser/event-file-uses';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { setDocumentFileRules } from '../documents-archive/archive-fixtures';
import {
  addEventType,
  call,
  colleagueOf,
  CREATE,
  eventBody,
  eventOfficer,
  READ,
  readyEvents,
  unitEvents,
  type Officer,
} from './event-fixtures';
import { fileBodyOf } from '../../core/files/file-bodies';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69EFNTV';
const TYPE = 'type-EF-fair';
let creator: Officer;
let lead: Officer;
let reader: Officer;
let eventId = '';

const files = () => `${unitEvents(creator.unitId)}/events/${eventId}/files`;
const list = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', files())).json<EventFileRecord[]>();

async function upload(o: Officer, section: string, use: string, fileName = 'programme.pdf') {
  const start = await call(o.clerkUserId, 'POST', `${files()}/uploads`, {
    section,
    use,
    fileName,
    size: 3,
    contentType: 'application/pdf',
  });
  if (!start.ok) return start;
  const { fileId } = await start.json<{ fileId: string }>();
  await env.FILES.put(
    `app-branch-EF1/event-organiser/${eventId}/${fileId}-${fileName}`,
    fileBodyOf('application/pdf'),
    {
      httpMetadata: { contentType: 'application/pdf' },
    },
  );
  return call(o.clerkUserId, 'PUT', files(), { section, use, fileId, fileName });
}

describe('event files: Documents and Media (brief 21 F1, F2; 9.3; D-185, D-196)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    creator = await eventOfficer({ suffix: 'EF1', notice: NOTICE, capabilities: [READ, CREATE] });
    lead = await colleagueOf(creator, { suffix: 'EF2', notice: NOTICE, capabilities: [READ] });
    reader = await colleagueOf(creator, { suffix: 'EF3', notice: NOTICE, capabilities: [READ] });
    await readyEvents(creator.unitId, creator.personId);
    await setDocumentFileRules(creator.personId);
    await addEventType(TYPE, 'Fair');
    const created = await call(
      creator.clerkUserId,
      'POST',
      `${unitEvents(creator.unitId)}/events`,
      {
        event: eventBody({ name: 'Spring fair', typeItemId: TYPE, leadPersonId: lead.personId }),
        templateId: null,
      },
    );
    eventId = (await created.json<{ id: string }>()).id;
  });

  it("is added by the lead officer, who needs no capability to manage events, into a section that takes the file's use", async () => {
    expect((await upload(reader, 'Documents', 'documents')).status).toBe(403);
    expect((await upload(lead, 'Media', 'documents')).status).toBe(409);
    expect((await upload(lead, 'Documents', 'documents')).status).toBe(204);
    expect((await list(reader)).map((f) => [f.section, f.fileName])).toEqual([
      ['Documents', 'programme.pdf'],
    ]);
  });

  it('is retired before close — hidden from readers, kept in storage — and brought back (D-196)', async () => {
    const [file] = await list(reader);
    const one = `${files()}/${file?.fileId ?? ''}`;
    expect((await call(reader.clerkUserId, 'POST', `${one}/retire`)).status).toBe(403);
    expect((await call(lead.clerkUserId, 'POST', `${one}/retire`)).status).toBe(204);
    expect(await list(reader)).toEqual([]);
    expect((await list(lead)).map((f) => f.retiredAt !== null)).toEqual([true]);
    const kept = await env.DB.prepare('SELECT key FROM files WHERE id = ?')
      .bind(file?.fileId)
      .first<{ key: string }>();
    expect(await env.FILES.head(kept?.key ?? '')).not.toBeNull();
    expect((await call(lead.clerkUserId, 'POST', `${one}/retire`)).status).toBe(409);
    expect((await call(lead.clerkUserId, 'POST', `${one}/restore`)).status).toBe(204);
    expect((await list(reader)).map((f) => f.fileName)).toEqual(['programme.pdf']);
    const audit = await env.DB.prepare(
      "SELECT action FROM audit_log WHERE action LIKE 'event.file-%' AND entity_id = ? ORDER BY rowid",
    )
      .bind(eventId)
      .all<{ action: string }>();
    expect(audit.results.map((r) => r.action)).toEqual([
      'event.file-added',
      'event.file-retired',
      'event.file-restored',
    ]);
  });

  it('is never deleted, in the database too (D-196)', async () => {
    await expect(
      env.DB.prepare('DELETE FROM event_files WHERE event_id = ?').bind(eventId).run(),
    ).rejects.toThrow(/never deleted/);
  });
});

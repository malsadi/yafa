import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  LetterInDetail,
  LetterInSummary,
} from '../../../src/shared/correspondence-and-letters/letter-records';
import { generateLetter } from '../../../src/worker/services/correspondence-and-letters';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { contextOf, storage } from '../../services/treasury/treasury-service-fixtures';
import {
  addTemplate,
  call,
  colleagueOf,
  fakeRenderer,
  letterBody,
  letterOfficer,
  READ,
  RECORD,
  recordLetterIn,
  roleOf,
  setLetterSettings,
  switchLettersOn,
  thisYear,
  unitLetters,
  WRITE,
  type Officer,
} from './letter-fixtures';
import { tryEveryRoute } from '../../immutability/try-every-route';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LINTV';
let clerk: Officer;
let handler: Officer;
let outsider: Officer;
const { render } = fakeRenderer();
const lettersIn = (unitId: string) => `${unitLetters(unitId)}/letters-in`;

async function record(details: Parameters<typeof recordLetterIn>[1]) {
  const res = await recordLetterIn(clerk, details);
  expect(res.status).toBe(201);
  return res.json<{ id: string; referenceNumber: string }>();
}
const read = async (officer: Officer, id: string) =>
  (
    await call(officer.clerkUserId, 'GET', `${lettersIn(clerk.unitId)}/${id}`)
  ).json<LetterInDetail>();
const move = async (officer: Officer, id: string, status: string) =>
  call(officer.clerkUserId, 'PUT', `${lettersIn(clerk.unitId)}/${id}/status`, {
    status,
    version: (await read(clerk, id)).version,
  });
const reply = (id: string | null) =>
  generateLetter(
    env.DB,
    contextOf(clerk),
    { storage, render },
    {
      ...letterBody({ templateId: 'tpl-LI1', signerRoleId: roleOf(clerk), replyTo: id }),
      unitId: clerk.unitId,
    },
  );

describe('letters received, their status and replies (brief 23 B1, B3, B4; D-214)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    clerk = await letterOfficer({
      suffix: 'LI1',
      notice: NOTICE,
      capabilities: [READ, WRITE, RECORD],
    });
    handler = await colleagueOf(clerk, { suffix: 'LI2', notice: NOTICE, capabilities: [] });
    outsider = await colleagueOf(clerk, { suffix: 'LI3', notice: NOTICE, capabilities: [] });
    await switchLettersOn(clerk.unitId);
    await setLetterSettings(clerk.personId);
    await addTemplate(clerk, { id: 'tpl-LI1' });
  });

  it('numbers letters in on their own sequence, files the scan under Letters in, and starts them Received', async () => {
    const first = await record({ handlerPersonId: handler.personId });
    expect(first.referenceNumber).toBe(`app-branch-LI1/IN/${String(thisYear())}/001`);
    const letter = await reply(null);
    expect(letter.referenceNumber).toBe(`app-branch-LI1/OUT/${String(thisYear())}/001`);
    const filed = await env.DB.prepare(
      'SELECT f.locked FROM library_letters_in l JOIN files f ON f.id = l.file_id WHERE l.letter_id = ?',
    )
      .bind(first.id)
      .first();
    expect(filed).toEqual({ locked: 1 });
    expect(await read(clerk, first.id)).toMatchObject({
      status: 'Received',
      handlerPersonId: handler.personId,
    });
  });

  it('refuses a future date, or a handler who is not a current officer (O-143)', async () => {
    const future = await recordLetterIn(clerk, {
      handlerPersonId: handler.personId,
      dateReceived: '2999-01-01',
    });
    expect(await future.json()).toEqual({
      error: { code: 'correspondence-and-letters.future-date' },
    });
    const stranger = await recordLetterIn(clerk, { handlerPersonId: 'not-an-officer' });
    expect(await stranger.json()).toEqual({
      error: { code: 'correspondence-and-letters.not-an-officer' },
    });
  });

  it('lets the handling officer see the letter and move its status with no capability, but nobody else (O-135)', async () => {
    const { id } = await record({ handlerPersonId: handler.personId });
    expect(
      (await call(outsider.clerkUserId, 'GET', `${lettersIn(clerk.unitId)}/${id}`)).status,
    ).toBe(403);
    expect((await move(outsider, id, 'Awaiting reply')).status).toBe(403);
    expect((await move(handler, id, 'Awaiting reply')).status).toBe(204);
    expect((await call(handler.clerkUserId, 'GET', lettersIn(clerk.unitId))).status).toBe(403);
  });

  it('moves Received → Awaiting reply or No reply needed and back, never to Replied by hand (O-144)', async () => {
    const { id } = await record({ handlerPersonId: handler.personId });
    expect(await (await move(clerk, id, 'Replied')).json()).toEqual({
      error: { code: 'correspondence-and-letters.wrong-status' },
    });
    expect((await move(clerk, id, 'No reply needed')).status).toBe(204);
    await expect(reply(id)).rejects.toThrow('correspondence-and-letters.not-answerable');
    expect((await move(clerk, id, 'Awaiting reply')).status).toBe(204);
    await reply(id);
    expect((await read(clerk, id)).status).toBe('Replied');
    expect((await move(clerk, id, 'Awaiting reply')).status).toBe(409);
  });

  it('keeps who handles it until it is closed (O-145), and refuses a stale change (9.1)', async () => {
    const { id } = await record({ handlerPersonId: handler.personId });
    const change = (version: number) =>
      call(clerk.clerkUserId, 'PUT', `${lettersIn(clerk.unitId)}/${id}/handler`, {
        handlerPersonId: outsider.personId,
        version,
      });
    expect((await change(1)).status).toBe(204);
    expect(await (await change(1)).json()).toEqual({
      error: { code: 'correspondence-and-letters.stale' },
    });
    await move(clerk, id, 'No reply needed');
    expect(await (await change((await read(clerk, id)).version)).json()).toEqual({
      error: { code: 'correspondence-and-letters.closed' },
    });
  });

  it('follows the whole exchange: our letter, their answer, and our reply to it (O-146)', async () => {
    const ours = await reply(null);
    const theirs = await record({ handlerPersonId: handler.personId, answersLetterOutId: ours.id });
    const again = await reply(theirs.id);
    const exchange = (await read(clerk, theirs.id)).exchange.map((l) => [l.direction, l.id]);
    expect(exchange).toEqual(
      expect.arrayContaining([
        ['out', ours.id],
        ['in', theirs.id],
        ['out', again.id],
      ]),
    );
    expect(exchange).toHaveLength(3);
    const register = await (
      await call(clerk.clerkUserId, 'GET', lettersIn(clerk.unitId))
    ).json<{ items: LetterInSummary[] }>();
    expect(register.items.find((l) => l.id === theirs.id)?.status).toBe('Replied');
  });

  it('corrects the letter out it answers while it is open, never once closed (D-216)', async () => {
    const ours = await reply(null);
    const { id } = await record({ handlerPersonId: handler.personId });
    const link = async (answersLetterOutId: string | null) =>
      call(clerk.clerkUserId, 'PUT', `${lettersIn(clerk.unitId)}/${id}/answers`, {
        answersLetterOutId,
        version: (await read(clerk, id)).version,
      });
    expect((await link(ours.id)).status).toBe(204);
    expect((await read(clerk, id)).answersLetterOutId).toBe(ours.id);
    expect(await (await link('not-ours')).json()).toEqual({
      error: { code: 'correspondence-and-letters.letter-not-found' },
    });
    expect((await link(null)).status).toBe(204);
    await move(clerk, id, 'No reply needed');
    expect(await (await link(ours.id)).json()).toEqual({
      error: { code: 'correspondence-and-letters.closed' },
    });
  });

  it('is never deleted, and only its status and handler ever change, in the database too', async () => {
    for (const sql of [
      'DELETE FROM letters_in',
      "UPDATE letters_in SET sender = 'Changed', version = version + 1",
      "UPDATE letters_in SET answers_letter_out_id = NULL, version = version + 1 WHERE status = 'Replied'",
      "UPDATE letters_in SET status = 'Replied', version = version + 1 WHERE status = 'Received'",
    ])
      await expect(env.DB.prepare(sql).run()).rejects.toThrow();
  });

  it('refuses every change to a replied letter through every route (brief 26; O-144, O-145)', async () => {
    const L = '/api/correspondence-and-letters/units/:unitId/letters-in/:letterId';
    const replied = await env.DB.prepare(
      "SELECT id, version FROM letters_in WHERE unit_id = ? AND status = 'Replied' LIMIT 1",
    )
      .bind(clerk.unitId)
      .first<{ id: string; version: number }>();
    expect(replied).not.toBeNull();
    const version = replied?.version ?? 1;
    for (const officer of [clerk, handler]) {
      const result = await tryEveryRoute(
        (method, path, body) => call(officer.clerkUserId, method, path, body),
        {
          prefixes: [L],
          params: { unitId: clerk.unitId, letterId: replied?.id ?? '' },
          bodies: {
            [`PUT ${L}`]: {
              fileId: 'x',
              fileName: 'late.pdf',
              dateReceived: '2026-01-01',
              sender: 'Changed',
              subject: 'Changed',
              handlerPersonId: handler.personId,
              answersLetterOutId: null,
            },
            [`PUT ${L}/status`]: { status: 'Received', version },
            [`PUT ${L}/handler`]: { handlerPersonId: clerk.personId, version },
            [`PUT ${L}/answers`]: { answersLetterOutId: null, version },
          },
          rows: [{ sql: 'SELECT * FROM letters_in WHERE id = ?', binds: [replied?.id ?? ''] }],
        },
      );
      expect(result.tried.length).toBeGreaterThanOrEqual(4);
      expect(result.accepted).toEqual([]);
      expect(result.failed).toEqual([]);
      expect(result.rowsChanged).toBe(false);
    }
  });
});

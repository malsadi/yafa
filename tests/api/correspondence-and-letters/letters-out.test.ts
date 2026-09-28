import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { LetterOutDetail } from '../../../src/shared/correspondence-and-letters/letter-records';
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
  roleOf,
  setLetterSettings,
  switchLettersOn,
  thisYear,
  unitLetters,
  WRITE,
  type Officer,
} from './letter-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LONTV';
let writer: Officer;
let reader: Officer;
let national: Officer;
let otherBranch: Officer;
const { rendered, render } = fakeRenderer();

const generate = (officer: Officer, body: Record<string, unknown>) =>
  generateLetter(
    env.DB,
    contextOf(officer),
    { storage, render },
    { ...(body as ReturnType<typeof letterBody>), unitId: officer.unitId },
  );

describe('writing letters (brief 23 A1, A2, B1, B2; D-214)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    writer = await letterOfficer({ suffix: 'LO1', notice: NOTICE, capabilities: [READ, WRITE] });
    reader = await colleagueOf(writer, { suffix: 'LO2', notice: NOTICE, capabilities: [READ] });
    national = await letterOfficer({
      suffix: 'LO3',
      notice: NOTICE,
      capabilities: [READ, WRITE],
      unitType: 'national',
    });
    otherBranch = await letterOfficer({
      suffix: 'LO4',
      notice: NOTICE,
      capabilities: [READ, WRITE],
    });
    for (const officer of [writer, national, otherBranch]) await switchLettersOn(officer.unitId);
    await addTemplate(writer, { id: 'tpl-LO1' });
    await addTemplate(writer, { id: 'tpl-LO1-retired', retired: true });
    await addTemplate(national, { id: 'tpl-LO3', subject: null });
  });

  it('waits for the reference formats and letterhead, and is only for those who write letters', async () => {
    await expect(
      generate(writer, letterBody({ templateId: 'tpl-LO1', signerRoleId: roleOf(writer) })),
    ).rejects.toThrow('setting.not-configured');
    await setLetterSettings(writer.personId);
    const res = await call(
      reader.clerkUserId,
      'GET',
      `${unitLetters(writer.unitId)}/writing-choices`,
    );
    expect(res.status).toBe(403);
  });

  it('offers the unit’s own and the national templates, never a retired one, and the writer’s own roles (O-140, O-141)', async () => {
    const res = await call(
      writer.clerkUserId,
      'GET',
      `${unitLetters(writer.unitId)}/writing-choices`,
    );
    const choices = await res.json<{
      templates: { id: string; national: boolean }[];
      signerRoles: { roleId: string }[];
    }>();
    expect(choices.templates.map((t) => [t.id, t.national]).sort()).toEqual([
      ['tpl-LO1', false],
      ['tpl-LO3', true],
    ]);
    expect(choices.signerRoles.map((r) => r.roleId)).toEqual([roleOf(writer)]);
  });

  it('refuses a missing field, a retired template, or a role the writer does not hold', async () => {
    const body = letterBody({ templateId: 'tpl-LO1', signerRoleId: roleOf(writer) });
    await expect(generate(writer, { ...body, fieldValues: { venue: 'Hall' } })).rejects.toThrow(
      'correspondence-and-letters.field-missing',
    );
    await expect(generate(writer, { ...body, templateId: 'tpl-LO1-retired' })).rejects.toThrow(
      'correspondence-and-letters.template-not-found',
    );
    await expect(generate(writer, { ...body, signerRoleId: roleOf(reader) })).rejects.toThrow(
      'correspondence-and-letters.not-your-role',
    );
  });

  it('numbers the letter, prints it on the letterhead signed by the writer, and files it under Letters out', async () => {
    const letter = await generate(
      writer,
      letterBody({ templateId: 'tpl-LO1', signerRoleId: roleOf(writer) }),
    );
    expect(letter.referenceNumber).toBe(`app-branch-LO1/OUT/${String(thisYear())}/001`);
    const printed = rendered.at(-1);
    expect(printed?.letter.heading?.reference).toBe(`Our reference: ${letter.referenceNumber}`);
    expect(printed?.letter.heading?.recipient).toEqual([
      'Fictional Hall Manager',
      '1 Fictional Street',
      'Exampletown',
    ]);
    expect(printed?.letter.subject).toBe('Thank you, Fictional Hall');
    expect(printed?.letter.paragraphs).toEqual([
      'Dear Ms Example,',
      'Thank you for hosting us at Fictional Hall.',
    ]);
    expect(printed?.letter.signer).toEqual({
      name: expect.any(String) as string,
      role: 'Role LO1',
      unit: 'Branch LO1',
    });
    const filed = await env.DB.prepare(
      'SELECT l.reference_number AS reference, f.locked FROM library_letters_out l JOIN files f ON f.id = l.file_id WHERE l.letter_id = ?',
    )
      .bind(letter.id)
      .all();
    expect(filed.results).toEqual([{ reference: letter.referenceNumber, locked: 1 }]);
  });

  it('writes from a national template on the branch’s own letterhead, with no subject line when the template has none', async () => {
    const letter = await generate(
      writer,
      letterBody({ templateId: 'tpl-LO3', signerRoleId: roleOf(writer) }),
    );
    expect(letter.referenceNumber).toBe(`app-branch-LO1/OUT/${String(thisYear())}/002`);
    expect(rendered.at(-1)?.unit.name).toBe('Branch LO1');
    expect(rendered.at(-1)?.letter.subject).toBeUndefined();
  });

  it('lists the register to the unit’s readers only, and never shows another unit’s letter (7.3)', async () => {
    const list = await call(reader.clerkUserId, 'GET', `${unitLetters(writer.unitId)}/letters-out`);
    const { items: letters } = await list.json<{ items: LetterOutDetail[] }>();
    expect(letters.map((l) => [l.referenceNumber, l.recipientName, l.subject])).toEqual([
      [
        `app-branch-LO1/OUT/${String(thisYear())}/002`,
        'Fictional Hall Manager',
        'Thanks for the hall',
      ],
      [
        `app-branch-LO1/OUT/${String(thisYear())}/001`,
        'Fictional Hall Manager',
        'Thanks for the hall',
      ],
    ]);
    const one = await call(
      reader.clerkUserId,
      'GET',
      `${unitLetters(writer.unitId)}/letters-out/${letters[0]?.id ?? ''}`,
    );
    expect(await one.json()).toMatchObject({
      signerRoleNameEn: 'Role LO1',
      exchange: [{ direction: 'out' }],
    });
    const elsewhere = await call(
      otherBranch.clerkUserId,
      'GET',
      `${unitLetters(otherBranch.unitId)}/letters-out/${letters[0]?.id ?? ''}`,
    );
    expect(elsewhere.status).toBe(404);
    expect(
      (await call(national.clerkUserId, 'GET', `${unitLetters(writer.unitId)}/letters-out`)).status,
    ).toBe(403);
  });

  it('is locked forever once generated, in the database too (O-142)', async () => {
    for (const sql of ["UPDATE letters_out SET subject = 'Changed'", 'DELETE FROM letters_out'])
      await expect(env.DB.prepare(sql).run()).rejects.toThrow(/locked/);
  });
});

import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../src/worker/core/settings';
import { generateLetter } from '../../../src/worker/services/correspondence-and-letters';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  addTemplate,
  fakeRenderer,
  letterBody,
  letterOfficer,
  roleOf,
  setLetterSettings,
  switchLettersOn,
  thisYear,
  WRITE,
  type Officer,
} from '../../api/correspondence-and-letters/letter-fixtures';
import { contextOf, storage } from '../treasury/treasury-service-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69LNNTV';
let writer: Officer;
const { render } = fakeRenderer();
const generate = () =>
  generateLetter(
    env.DB,
    contextOf(writer),
    { storage, render },
    {
      ...letterBody({ templateId: 'tpl-LN1', signerRoleId: roleOf(writer) }),
      unitId: writer.unitId,
    },
  );

describe('letter numbers (brief 23 B1 and build notes; D-214; T-154)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    writer = await letterOfficer({ suffix: 'LN1', notice: NOTICE, capabilities: [WRITE] });
    await switchLettersOn(writer.unitId);
    await setLetterSettings(writer.personId);
    await addTemplate(writer, { id: 'tpl-LN1' });
  });

  it('restarts at 1 each year: last year’s count does not carry over (O-137)', async () => {
    await env.DB.prepare(
      "INSERT INTO letter_counters (unit_id, direction, year, last_number) VALUES (?, 'out', ?, 41)",
    )
      .bind(writer.unitId, thisYear() - 1)
      .run();
    expect((await generate()).referenceNumber).toBe(`app-branch-LN1/OUT/${String(thisYear())}/001`);
  });

  it('gives letters generated at the same moment different numbers, with no gaps', async () => {
    const letters = await Promise.all([generate(), generate(), generate()]);
    const numbers = letters.map((l) => l.referenceNumber.split('/').at(-1)).sort();
    expect(numbers).toEqual(['002', '003', '004']);
  });

  it('never moves a counter back or removes it, in the database', async () => {
    for (const sql of [
      'UPDATE letter_counters SET last_number = last_number - 1',
      'UPDATE letter_counters SET last_number = last_number + 2',
      'DELETE FROM letter_counters',
    ])
      await expect(env.DB.prepare(sql).run()).rejects.toThrow(/letter counter/);
  });

  it('refuses a format setting without the year or the number (O-137)', async () => {
    for (const value of ['{unit_code}/{number}', '{unit_code}/{year}'])
      await expect(
        setSetting(env.DB, {
          key: 'correspondence-and-letters.reference_format_out',
          value,
          actorPersonId: writer.personId,
        }),
      ).rejects.toThrow();
  });
});

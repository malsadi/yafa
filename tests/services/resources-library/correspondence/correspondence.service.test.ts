import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { fileLetter } from '../../../../src/worker/services/resources-library';
import { fileFor, insertFileStatement, insertUnitForFiling } from '../../filed-file';

const UNIT = 'u-library-letters';
const file = (id: string, locked = true) => fileFor(UNIT, id, locked);
const exec = (sql: string) => env.DB.prepare(sql).run();

describe('fileLetter() (brief 16 D2, D3)', () => {
  beforeAll(async () => {
    await insertUnitForFiling(env.DB, UNIT);
  });

  it('files letters out and in under their reference numbers', async () => {
    await env.DB.batch([
      insertFileStatement(env.DB, file('f-out-1')),
      fileLetter(env.DB, 'out', {
        file: file('f-out-1'),
        referenceNumber: 'REF-1',
        letterId: 'l-1',
      }),
      insertFileStatement(env.DB, file('f-in-1')),
      fileLetter(env.DB, 'in', { file: file('f-in-1'), referenceNumber: 'REF-1', letterId: 'l-2' }),
    ]);
    const out = await env.DB.prepare(
      'SELECT unit_id, file_id FROM library_letters_out WHERE reference_number = ?',
    )
      .bind('REF-1')
      .first();
    const inbound = await env.DB.prepare(
      'SELECT unit_id, file_id FROM library_letters_in WHERE reference_number = ?',
    )
      .bind('REF-1')
      .first();
    expect(out).toEqual({ unit_id: UNIT, file_id: 'f-out-1' });
    expect(inbound).toEqual({ unit_id: UNIT, file_id: 'f-in-1' });
  });

  it('files one letter per reference number in a unit', async () => {
    await env.DB.batch([insertFileStatement(env.DB, file('f-out-2'))]);
    await expect(
      fileLetter(env.DB, 'out', {
        file: file('f-out-2'),
        referenceNumber: 'REF-1',
        letterId: 'l-3',
      }).run(),
    ).rejects.toThrow(/UNIQUE/);
  });

  it('refuses a file that is not locked, in the service and in the database', async () => {
    expect(() =>
      fileLetter(env.DB, 'in', {
        file: file('f-in-3', false),
        referenceNumber: 'REF-3',
        letterId: 'l-4',
      }),
    ).toThrow('resources-library.file-not-locked');
    await env.DB.batch([insertFileStatement(env.DB, file('f-in-3', false))]);
    await expect(
      exec(
        `INSERT INTO library_letters_in VALUES ('x', '${UNIT}', 'REF-3', 'l-4', 'f-in-3', 'now')`,
      ),
    ).rejects.toThrow(/must be locked/);
  });

  it('never changes or deletes a filed letter', async () => {
    for (const table of ['library_letters_out', 'library_letters_in']) {
      await expect(
        exec(`UPDATE ${table} SET letter_id = 'x' WHERE unit_id = '${UNIT}'`),
      ).rejects.toThrow(/never changed/);
      await expect(exec(`DELETE FROM ${table} WHERE unit_id = '${UNIT}'`)).rejects.toThrow(
        /never deleted/,
      );
    }
  });
});

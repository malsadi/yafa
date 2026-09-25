import { describe, expect, it } from 'vitest';
import { checkSeed } from '../../../scripts/seed/check-seed.ts';
import { TODAY, VALID_SEED } from './seed-fixtures.ts';

const errorsFor = (changes: Partial<typeof VALID_SEED>) =>
  checkSeed({ ...VALID_SEED, ...changes }, TODAY).errors;

describe('checkSeed (docs/seed-files.md)', () => {
  it('passes the spec’s examples, keeping one person per email', () => {
    const { input, errors } = checkSeed(VALID_SEED, TODAY);

    expect(errors).toEqual([]);
    expect(input.units).toHaveLength(3);
    expect(new Set(input.terms.map((t) => t.email)).size).toBe(2);
  });

  it('reports a missing or misspelled header', () => {
    expect(errorsFor({ units: VALID_SEED.units.replace('name_en', 'name') })).toContain(
      'units.csv: the header must be exactly "type,code,name_en,name_ar,area,status".',
    );
  });

  it('needs exactly one national unit, active and without an area', () => {
    const errors = errorsFor({
      units: VALID_SEED.units.replace(',,active', ',London,inactive'),
    });
    expect(errors).toContain('units.csv row 2: the national row has no area.');
    expect(errors).toContain('units.csv row 2: the national row must be active.');
  });

  it('needs each designation on exactly one role', () => {
    expect(
      errorsFor({ roles: VALID_SEED.roles.replace(',Branch register officer', ',') }),
    ).toContain('roles.csv: exactly one role must be the Branch register officer, not 0.');
  });

  it('needs at least two system administrators, each with a current term (P21, D-027)', () => {
    const errors = errorsFor({
      people: VALID_SEED.people.replace(
        '07700 900001,yes,Chair,GC,2026-01-15,',
        '07700 900001,yes,Chair,GC,2026-01-15,2026-02-01',
      ),
    });
    expect(errors).toContain(
      'people.csv: system administrator ada.example@example.org has no current term on 2026-09-25 (D-027).',
    );
    expect(errorsFor({ people: VALID_SEED.people.replace('900001,yes', '900001,no') })).toContain(
      'people.csv: at least 2 people must be system administrators (P21).',
    );
  });

  it('refuses unknown roles and units, a term in an inactive branch, and differing details', () => {
    const errors = errorsFor({
      people: `${VALID_SEED.people}\nsami.example@example.org,Sam,07700 900002,yes,Chair,STH,2026-01-01,`,
    });
    expect(errors).toContain(
      'people.csv row 5: unit STH is inactive, so its register is read-only (P4).',
    );
    expect(errors).toContain(
      'people.csv row 5: sami.example@example.org must have the same name, phone and system_administrator on every row.',
    );
  });

  it('keeps the national register officer in the national unit, and needs both notices', () => {
    const errors = errorsFor({
      people: VALID_SEED.people.replace(
        'National Register Officer,GC',
        'National Register Officer,NTH',
      ),
      noticeAr: '  ',
    });
    expect(errors).toContain(
      "people.csv: sami.example@example.org's National register officer term must be in the national unit.",
    );
    expect(errors).toContain('privacy-notice-ar.txt must not be empty (D-051).');
  });
});

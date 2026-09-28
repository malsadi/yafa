import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isConfirmed } from '../../../scripts/production/confirm-production';
import { SEED_TARGETS } from '../../../scripts/seed/seed-target';

// D-220: the owner loads production's first officers and sets its push keys
// with the same scripts as the preview, and each asks them to type the name
// of what it will change before writing anything.
const source = (file: string) => readFileSync(file, 'utf8');

describe('writing to production needs the owner to type its name (D-220)', () => {
  it('accepts only the exact name', () => {
    expect(isConfirmed('yafa-portal-production-db', 'yafa-portal-production-db')).toBe(true);
    expect(isConfirmed('  yafa-portal-production-db \n', 'yafa-portal-production-db')).toBe(true);
    for (const typed of ['', 'y', 'yes', 'yafa-portal-preview-db', 'YAFA-PORTAL-PRODUCTION-DB'])
      expect(isConfirmed(typed, 'yafa-portal-production-db')).toBe(false);
  });

  it("loads the seed into production's own database, and only after confirming", () => {
    const wrangler = source('wrangler.jsonc');
    const production = wrangler.slice(wrangler.indexOf('"production": {'));
    expect(production).toContain(`"database_name": "${SEED_TARGETS.production.database}"`);
    expect(SEED_TARGETS.production.flags).toEqual(['--remote', '--env', 'production']);
    const loader = source('scripts/seed/load-seed.ts');
    expect(loader.indexOf('confirmProduction(')).toBeGreaterThan(-1);
    expect(loader.indexOf('confirmProduction(')).toBeLessThan(loader.indexOf('runFileOnTarget('));
  });

  it('sets production push keys only after confirming, and never replaces existing ones', () => {
    const keys = source('scripts/push/create-push-keys.ts');
    expect(keys).toContain("production: 'yafa-portal-production'");
    expect(keys.indexOf('Refused: the')).toBeLessThan(keys.indexOf('confirmProduction('));
    expect(keys.indexOf('confirmProduction(')).toBeLessThan(keys.indexOf("'secret', 'put'"));
  });
});

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  renderPermissionsDoc,
  type CatalogueSection,
} from '../../scripts/permissions-doc/render-permissions-doc.ts';
import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../src/shared/administration-panel/capabilities';
import { COMMITTEE_REGISTER_CAPABILITIES } from '../../src/shared/committee-register/capabilities';

const DOC = path.join(import.meta.dirname, '../../docs/permissions.md');
const CAPABILITY_PATTERN = /^[a-z][a-z-]*\.[a-z][a-z-]*\.[a-z][a-z-]*$/;

// Brief section 3.1's order. Each service's own capabilities.ts.
const SECTIONS: (CatalogueSection & { slug: string })[] = [
  {
    slug: 'committee-register',
    service: 'Committee register',
    capabilities: COMMITTEE_REGISTER_CAPABILITIES,
  },
  {
    slug: 'administration-panel',
    service: 'Administration panel',
    capabilities: ADMINISTRATION_PANEL_CAPABILITIES,
  },
];

describe('capability catalogue (brief section 7.2)', () => {
  const all = SECTIONS.flatMap((section) => section.capabilities);

  it('names every capability <service>.<resource>.<action>, once, under its own service', () => {
    expect(new Set(all.map((c) => c.capability)).size).toBe(all.length);
    for (const section of SECTIONS) {
      for (const definition of section.capabilities) {
        expect(definition.capability).toMatch(CAPABILITY_PATTERN);
        expect(definition.capability.startsWith(`${section.slug}.`), definition.capability).toBe(
          true,
        );
      }
    }
  });

  it('only fixes a grant at a scope the capability allows', () => {
    for (const definition of all) {
      for (const fixed of definition.fixedGrants ?? []) {
        expect(definition.allowedScopes, definition.capability).toContain(fixed.scope);
      }
    }
  });

  it('is documented in docs/permissions.md, up to date (run `npm run permissions-doc`)', () => {
    const rendered = renderPermissionsDoc(SECTIONS);
    if (process.env.UPDATE_PERMISSIONS_DOC === '1') {
      writeFileSync(DOC, rendered);
    }
    expect(readFileSync(DOC, 'utf8')).toBe(rendered);
  });
});

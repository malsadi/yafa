import { RoleDesignation } from '../../src/shared/committee-register/role-designation.ts';
import type { SeedPlanInput } from './seed-plan-input.ts';
import { isCurrentTerm } from './seed-dates.ts';

// P21 (D-042): at least two system administrators always remain.
const MINIMUM_SYSTEM_ADMINISTRATORS = 2;

/**
 * docs/seed-files.md section 3's launch checks: at least two system
 * administrators (P21), each with a current term (D-027: without one,
 * nobody reaches the portal), and the national register officer's term in
 * the national unit.
 */
export function checkLaunchPeople(input: SeedPlanInput, today: string, errors: string[]): void {
  const admins = [...new Set(input.terms.filter((t) => t.systemAdministrator).map((t) => t.email))];
  if (admins.length < MINIMUM_SYSTEM_ADMINISTRATORS) {
    errors.push(
      `people.csv: at least ${String(MINIMUM_SYSTEM_ADMINISTRATORS)} people must be system administrators (P21).`,
    );
  }
  for (const email of admins) {
    if (!input.terms.some((t) => t.email === email && isCurrentTerm(t, today))) {
      errors.push(
        `people.csv: system administrator ${email} has no current term on ${today} (D-027).`,
      );
    }
  }
  const nro = input.roles.find((r) => r.designation === RoleDesignation.NationalRegisterOfficer);
  const national = input.units.find((u) => u.type === 'national');
  const nroTerms = input.terms.filter((t) => t.roleNameEn === nro?.nameEn);
  if (nroTerms.length === 0)
    errors.push('people.csv: no one holds the National register officer role.');
  for (const term of nroTerms) {
    if (term.unitCode !== national?.code) {
      errors.push(
        `people.csv: ${term.email}'s National register officer term must be in the national unit.`,
      );
    }
  }
}

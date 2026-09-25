import type { SeedRole } from './check-roles.ts';
import type { SeedTerm } from './check-people.ts';
import type { SeedUnit } from './check-units.ts';

/** Everything the seed files hold, once checked. */
export interface SeedPlanInput {
  units: SeedUnit[];
  roles: SeedRole[];
  terms: SeedTerm[];
  notice: { en: string; ar: string };
}

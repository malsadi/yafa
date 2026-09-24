import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 8's settings (brief 8.1: each service registers its own, with no
 * default). Brief 25 B2: whether branches may add extra roles of their own.
 * Until the administrator sets it, adding a branch role waits (rule 5).
 */
export function registerCommitteeRegisterSettings(): void {
  registerSetting({
    key: 'committee-register.branches_may_add_roles',
    label: 'Branches may add extra roles',
    description:
      'Whether a branch may add roles of its own beyond the standard list (14 B2, 25 B2).',
    schema: z.boolean(),
    required: false,
    unitOverrideAllowed: false,
  });
}

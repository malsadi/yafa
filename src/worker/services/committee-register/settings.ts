import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 8's settings (brief 8.1: each service registers its own, with no
 * default). Brief 25 B2: whether branches may add extra roles of their own;
 * until set, adding a branch role waits (rule 5). Brief 6.2 and 14: whether
 * an account locks when its last term ends; until set, none does (T-087).
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
  registerSetting({
    key: 'committee-register.lock_account_when_last_term_ends',
    label: 'Lock the account when the last term ends',
    description:
      "Whether a person's sign-in account is locked automatically when their last current term ends (6.2, 14).",
    schema: z.boolean(),
    required: false,
    unitOverrideAllowed: false,
  });
}

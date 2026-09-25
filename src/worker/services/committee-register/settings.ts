import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 8's settings (brief 8.1: each service registers its own, with no
 * default). Brief 25 B2: whether branches may add extra roles of their own;
 * until set, adding a branch role waits (rule 5). Brief 6.2 and 14: whether
 * an account locks when its last term ends; until set, none does (T-087).
 * Brief 14 B3: the window in which a term's end counts as "ending soon",
 * in whole days; until set, nothing is highlighted and the register says
 * so. Brief 6.3 and 14: the roles whose holders must use multi-factor
 * authentication; until set, only system administrators must (T-100).
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
  registerSetting({
    key: 'committee-register.terms_ending_soon_window_days',
    label: 'Terms ending soon window (days)',
    description:
      'How many days before its end date a term is highlighted as ending soon in the register (14 B3).',
    schema: z.number().int().positive(),
    required: false,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'committee-register.roles_requiring_mfa',
    label: 'Roles requiring multi-factor authentication',
    description:
      'The roles whose holders must sign in with a second factor; system administrators always must (6.3, 14).',
    schema: z.array(z.string().min(1)),
    input: { kind: 'roles' },
    required: false,
    unitOverrideAllowed: false,
  });
}

import { z } from 'zod';
import { BRANCH_ACCOUNT_TYPES } from '../../../../shared/treasury/treasury-statuses';

/**
 * Brief 17 A1, P6, D-117 and D-119: a branch account's name, whether it is
 * a bank or cash account, and its opening balance in pence — zero or
 * negative too — with the date it was opened at.
 */
export const openBranchAccountSchema = z.object({
  name: z.string().trim().min(1),
  branchType: z.enum(BRANCH_ACCOUNT_TYPES),
  openingBalancePence: z.number().int(),
  openingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type OpenBranchAccount = z.infer<typeof openBranchAccountSchema>;

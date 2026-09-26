import { z } from 'zod';
import { isFixedDayOfYear } from '../../../shared/treasury/financial-year';
import { registerSetting } from '../../core/settings';

/**
 * Service 3's settings (brief 17; 8.1: each registers its own, with no
 * default). The approval threshold, in pence (9.1): a debit or transfer
 * above it waits for a second officer (B5, D-122). The financial year's
 * first day (C3, D-128). Whether a credit or debit needs a receipt photo
 * to be saved (B4, D-123). All three are required before the Treasury is
 * switched on (15 C6); the first two may differ per unit (17).
 */
export function registerTreasurySettings(): void {
  registerSetting({
    key: 'treasury.approval_threshold',
    label: 'Approval threshold',
    description:
      'A debit or transfer above this amount needs a second officer to approve it (17 B5; D-122).',
    schema: z.number().int().nonnegative(),
    input: { kind: 'money' },
    required: true,
    unitOverrideAllowed: true,
  });
  registerSetting({
    key: 'treasury.financial_year_start',
    label: 'Financial year start',
    description: 'The day and month each financial year begins (17 C3; D-128).',
    schema: z
      .object({ month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) })
      .refine(isFixedDayOfYear, { message: 'A day every year has.' }),
    input: { kind: 'day-and-month' },
    required: true,
    unitOverrideAllowed: true,
  });
  registerSetting({
    key: 'treasury.receipt_required',
    label: 'Receipt required',
    description: 'Whether a credit or debit can be saved only with a receipt photo (17 B4; D-123).',
    schema: z.boolean(),
    required: true,
    unitOverrideAllowed: false,
  });
}

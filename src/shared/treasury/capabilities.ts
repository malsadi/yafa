import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// D-132: each capability works in the officer's own unit only. The General
// Council sees branches' filed statements in the archive (P2), never their
// live Treasury.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 3, Treasury (brief section 17). Granted in the permissions matrix. */
export const TREASURY_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'treasury.accounts.read',
    label: 'Read the Treasury',
    description:
      "See the unit's accounts, balances, entries, receipts and statements (17 A, B, C1, C2).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.accounts.manage',
    label: 'Open and close branch accounts',
    description:
      'Open a branch account with its opening balance, and close one at a zero balance (17 A1; P6, D-117 to D-119).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.credit.create',
    label: 'Record credits',
    description: 'Record money in, with its receipt photos, and add receipts later (17 B1, B4).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.debit.create',
    label: 'Record debits',
    description: 'Record money out, with its receipt photos, and add receipts later (17 B2, B4).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.transfer.create',
    label: 'Record transfers',
    description: "Move money between the unit's own open accounts (17 B3; D-122).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.debit.approve',
    label: 'Approve payments',
    description:
      'Approve or decline debits and transfers above the threshold — never one the same officer entered (17 B5; P7, D-122).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.entries.correct',
    label: 'Correct entries',
    description: 'Record a reversing entry that undoes a mistake (17 B6; D-125).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.statements.file',
    label: 'File statements',
    description: "File an account's statement to the Documents archive (17 C2; P9).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'treasury.year-end.close',
    label: 'Close the financial year',
    description: 'Close a financial year and lock its entries (17 C3; D-128).',
    allowedScopes: OWN_UNIT,
  },
];

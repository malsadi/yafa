export const treasuryText = {
  name: 'Treasury',
  capabilities: {
    'treasury.accounts.read': 'Read the Treasury',
    'treasury.accounts.manage': 'Open and close branch accounts',
    'treasury.credit.create': 'Record credits',
    'treasury.debit.create': 'Record debits',
    'treasury.transfer.create': 'Record transfers',
    'treasury.debit.approve': 'Approve payments',
    'treasury.entries.correct': 'Correct entries',
    'treasury.statements.file': 'File statements',
    'treasury.year-end.close': 'Close the financial year',
  },
  settings: {
    'treasury.approval_threshold': 'Approval threshold',
    'treasury.financial_year_start': 'Financial year start',
    'treasury.receipt_required': 'Receipt required',
  },
};

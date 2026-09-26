import { treasuryAccountsText } from './treasury-accounts';
import { treasuryApprovalsText } from './treasury-approvals';
import { treasuryEntriesText } from './treasury-entries';
import { treasuryRefusalsText } from './treasury-refusals';
import { treasuryStatementsText } from './treasury-statements';
import { treasuryYearsText } from './treasury-years';

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
  statementPdf: {
    title: 'Statement: {account}',
    period: '{from} to {to}',
    headings: { date: 'Date', details: 'Details', in: 'In', out: 'Out', balance: 'Balance' },
    opening: 'Balance at the start of the period',
    closing: 'Balance at the end of the period',
    types: {
      'opening-balance': 'Opening balance',
      credit: 'Credit',
      debit: 'Debit',
      transferIn: 'Transfer from {account}',
      transferOut: 'Transfer to {account}',
    },
    reversal: '{type} (reversal)',
  },
  accounts: treasuryAccountsText,
  entries: treasuryEntriesText,
  approvals: treasuryApprovalsText,
  statements: treasuryStatementsText,
  years: treasuryYearsText,
  refusals: treasuryRefusalsText,
};

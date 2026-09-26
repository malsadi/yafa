/** Brief 17 A and C1: accounts and balances. */
export const treasuryAccountsText = {
  sections: {
    label: 'Treasury sections',
    accounts: 'Accounts',
    approvals: 'Awaiting approval',
    years: 'Financial years',
  },
  heading: 'Accounts',
  none: 'No accounts yet.',
  unitTotal: 'Total of open accounts: {total}',
  kinds: { bank: 'Bank', cash: 'Cash', event: 'Event' },
  statuses: { Open: 'Open', Closed: 'Closed' },
  awaiting: '{count} awaiting approval',
  belowZero: 'Below zero',
  open: 'Open a branch account',
  name: 'Name',
  type: 'Bank or cash',
  openingBalance: 'Opening balance (£, may be negative)',
  openingDate: 'Opened on',
  save: 'Open account',
  cancel: 'Cancel',
  close: 'Close account',
  closeExplanation:
    'An account closes only at a zero balance, with nothing awaiting approval. It is kept, with its history, and never reopened.',
  amountInvalid: 'Write the amount in pounds, such as 150 or -20.50.',
  back: 'Back to accounts',
  balance: 'Balance: {balance}',
};

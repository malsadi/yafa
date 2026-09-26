import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/treasury/units/:unitId';
const cap = (capability: string) => ({ kind: 'capability', capability }) as const;
const READ = cap('treasury.accounts.read');
const APPROVE = cap('treasury.debit.approve');

/** The receipt routes of a credit or of a debit (D-123). */
const receipts = (type: 'credit' | 'debit'): RouteDeclaration[] => [
  {
    method: 'POST',
    path: `${UNIT}/${type}s/receipts/uploads`,
    access: cap(`treasury.${type}.create`),
  },
  {
    method: 'POST',
    path: `${UNIT}/${type}s/:entryId/receipts/uploads`,
    access: cap(`treasury.${type}.create`),
  },
  {
    method: 'PUT',
    path: `${UNIT}/${type}s/:entryId/receipts`,
    access: cap(`treasury.${type}.create`),
  },
];

/** Brief 7.4: the Treasury's routes, in the order the app registers them. */
export const TREASURY_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/accounts`, access: READ },
  { method: 'POST', path: `${UNIT}/accounts`, access: cap('treasury.accounts.manage') },
  {
    method: 'POST',
    path: `${UNIT}/accounts/:accountId/close`,
    access: cap('treasury.accounts.manage'),
  },
  { method: 'GET', path: `${UNIT}/accounts/:accountId/entries`, access: READ },
  { method: 'POST', path: `${UNIT}/credits`, access: cap('treasury.credit.create') },
  { method: 'POST', path: `${UNIT}/debits`, access: cap('treasury.debit.create') },
  { method: 'POST', path: `${UNIT}/transfers`, access: cap('treasury.transfer.create') },
  ...receipts('credit'),
  ...receipts('debit'),
  { method: 'GET', path: `${UNIT}/entries/:entryId/receipts/:receiptId/file`, access: READ },
  { method: 'GET', path: `${UNIT}/approvals`, access: APPROVE },
  { method: 'POST', path: `${UNIT}/entries/:entryId/approve`, access: APPROVE },
  { method: 'POST', path: `${UNIT}/entries/:entryId/decline`, access: APPROVE },
  {
    method: 'POST',
    path: `${UNIT}/entries/:entryId/reverse`,
    access: cap('treasury.entries.correct'),
  },
];

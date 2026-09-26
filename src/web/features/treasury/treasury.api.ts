import type { StatementData } from '../../../shared/treasury/statement';
import type {
  AccountHistory,
  AccountsView,
  EntryRecord,
  FinancialYearRecord,
  SavedEntry,
} from '../../../shared/treasury/treasury-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const treasuryPath = (unitId: string) => `/api/treasury/units/${unitId}`;

export const fetchAccounts = (request: Request, unitId: string) =>
  request<AccountsView>(`${treasuryPath(unitId)}/accounts`);

export function fetchAccountHistory(
  request: Request,
  unitId: string,
  accountId: string,
  period: { from: string; to: string },
) {
  const query = new URLSearchParams(Object.entries(period).filter(([, v]) => v !== '')).toString();
  return request<AccountHistory>(
    `${treasuryPath(unitId)}/accounts/${accountId}/entries${query ? `?${query}` : ''}`,
  );
}

export const fetchAwaiting = (request: Request, unitId: string) =>
  request<EntryRecord[]>(`${treasuryPath(unitId)}/approvals`);

export const fetchYears = (request: Request, unitId: string) =>
  request<FinancialYearRecord[]>(`${treasuryPath(unitId)}/financial-years`);

export const fetchStatement = (
  request: Request,
  unitId: string,
  accountId: string,
  period: { from: string; to: string },
) =>
  request<StatementData>(
    `${treasuryPath(unitId)}/accounts/${accountId}/statement?from=${period.from}&to=${period.to}`,
  );

export const post = <T = undefined>(
  request: Request,
  unitId: string,
  path: string,
  body: object = {},
) => request<T>(`${treasuryPath(unitId)}${path}`, { method: 'POST', body });

export type { SavedEntry };

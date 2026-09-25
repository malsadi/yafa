import type {
  AccountAction,
  OfficerAccount,
} from '../../../../shared/administration-panel/account-state';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/officer-accounts';

export function fetchOfficerAccounts(request: Request): Promise<OfficerAccount[]> {
  return request<OfficerAccount[]>(PATH);
}

export function resendInvitation(
  request: Request,
  personId: string,
): Promise<{ invitation: 'sent' | 'failed' }> {
  return request<{ invitation: 'sent' | 'failed' }>(`${PATH}/${personId}/invitation`, {
    method: 'POST',
  });
}

export function runAccountAction(
  request: Request,
  personId: string,
  action: AccountAction,
): Promise<void> {
  return request<undefined>(`${PATH}/${personId}/${action}`, { method: 'POST' });
}

import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchSetupChecklist } from './setup-checklist.api';

/** Brief 25 C6: everything required that is not yet configured. */
export function useSetupChecklist() {
  const request = useApiRequest();
  return useQuery({ queryKey: ['setup-checklist'], queryFn: () => fetchSetupChecklist(request) });
}

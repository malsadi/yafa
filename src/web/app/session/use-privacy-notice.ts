import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../api/use-api-request';
import { fetchPrivacyNotice } from './privacy-notice.api';

export function usePrivacyNotice() {
  const request = useApiRequest();
  return useQuery({ queryKey: ['privacy-notice'], queryFn: () => fetchPrivacyNotice(request) });
}

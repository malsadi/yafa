import { useQuery } from '@tanstack/react-query';
import type { AlertChoicesView } from '../../../shared/communication-hub/alert-choices';
import type { PushSetup } from '../../../shared/communication-hub/push-setup';
import { useApiRequest } from '../../app/api/use-api-request';
import { HUB_KEY } from './hub-keys';

export const ALERT_CHOICES_PATH = '/api/communication-hub/alert-choices';
export const PUSH_PATH = '/api/communication-hub/push';

/** Brief 20 C2: the officer's alerts — their own choice, or the starting ones (D-163). */
export function useAlertChoices() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, 'alert-choices'],
    queryFn: () => request<AlertChoicesView>(ALERT_CHOICES_PATH),
  });
}

/** Brief 20 C1 and D-086: the portal's push key and the iPhone install guide. */
export function usePushSetup() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, 'push-setup'],
    queryFn: () => request<PushSetup>(`${PUSH_PATH}/setup`),
  });
}

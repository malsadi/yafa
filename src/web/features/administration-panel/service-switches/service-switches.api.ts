import type { ServiceSwitchesView } from '../../../../shared/administration-panel/service-switches';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/service-switches';

export const fetchServiceSwitches = (request: Request) => request<ServiceSwitchesView>(PATH);

/** On, off, or null to return a unit to the portal-wide value. */
export const changeServiceSwitch = (
  request: Request,
  service: string,
  change: { enabled: boolean | null; unitId?: string },
) => request<undefined>(`${PATH}/${service}`, { method: 'PUT', body: change });

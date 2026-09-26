import { useOutletContext } from 'react-router';
import type { MeUnit } from '../../../shared/core/me-response';

/** The selected unit whose Communication hub is open, from its layout. */
export function useHubUnit(): MeUnit {
  return useOutletContext<MeUnit>();
}

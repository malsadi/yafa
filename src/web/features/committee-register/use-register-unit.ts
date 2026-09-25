import { useOutletContext } from 'react-router';
import type { UnitRecord } from '../../../shared/committee-register/unit-record';

/** The unit whose register is open, from the register layout. */
export function useRegisterUnit(): UnitRecord {
  return useOutletContext<UnitRecord>();
}

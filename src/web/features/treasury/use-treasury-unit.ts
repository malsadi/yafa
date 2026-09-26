import { useOutletContext } from 'react-router';

/** The selected unit whose Treasury is open, from the Treasury's layout. */
export function useTreasuryUnit(): string {
  return useOutletContext<string>();
}

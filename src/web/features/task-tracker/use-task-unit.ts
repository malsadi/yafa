import { useOutletContext } from 'react-router';

/** The selected unit whose Task tracker is open, from its layout. */
export function useTaskUnit(): string {
  return useOutletContext<string>();
}

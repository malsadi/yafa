import { useOutletContext } from 'react-router';

/** The selected unit whose Event organiser is open, from its layout. */
export function useEventUnit(): string {
  return useOutletContext<string>();
}

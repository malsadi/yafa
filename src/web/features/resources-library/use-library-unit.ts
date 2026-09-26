import { useOutletContext } from 'react-router';

/** The selected unit whose library is open, from the library's layout. */
export function useLibraryUnit(): string {
  return useOutletContext<string>();
}

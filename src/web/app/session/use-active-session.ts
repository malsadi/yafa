import { useContext } from 'react';
import { ActiveSessionContext, type ActiveSession } from './active-session-context';

export function useActiveSession(): ActiveSession {
  const session = useContext(ActiveSessionContext);
  if (!session) {
    throw new Error('useActiveSession must be used inside an active session');
  }
  return session;
}

import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';

/** The roles screen's shared query key: any change reloads both sections. */
export const ROLES_KEY = ['roles'] as const;

/** Keeps the last refusal's code, and reloads after every change either way. */
export function useRefusal(reload: () => Promise<void>) {
  const [refusal, setRefusal] = useState<string | null>(null);
  const settle = (error: Error | null) => {
    setRefusal(error ? (error instanceof ApiError ? error.code : 'server.error') : null);
    return reload();
  };
  return { refusal, settle };
}

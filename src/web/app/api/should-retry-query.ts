import { ApiError } from './api-error';

/** TanStack Query's own default number of tries after the first. */
const DEFAULT_RETRIES = 3;

/**
 * T-163: a refusal (4xx: not allowed, not found, not set, too many
 * requests) gets the same answer however often it is asked, so it is shown
 * at once and never repeated. A network failure or a server error may pass,
 * so it is tried again as before.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < DEFAULT_RETRIES;
}

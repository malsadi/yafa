import { AppError } from './app-error';

/**
 * 401: no valid Clerk session token at all (missing, malformed, expired,
 * bad signature). Distinct from `ForbiddenError` (403): that one means
 * "signed in, but not this" — this one means "not signed in" (brief
 * section 6.3's session middleware).
 */
export class UnauthorizedError extends AppError {
  constructor(code: string) {
    super(code, 401);
  }
}

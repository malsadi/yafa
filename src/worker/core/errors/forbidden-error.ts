import { AppError } from './app-error';

/**
 * 403: the officer is signed in but the action isn't theirs to take. Prefer
 * `NotFoundError` instead wherever revealing that the record exists would
 * itself leak information (brief section 7.4).
 */
export class ForbiddenError extends AppError {
  constructor(code: string) {
    super(code, 403);
  }
}

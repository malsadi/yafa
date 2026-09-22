import { AppError } from './app-error';

/**
 * 404: nothing here, or nothing here *for this officer* — the default
 * choice over `ForbiddenError` (brief section 7.4: "return 404 instead of
 * 403 wherever revealing existence would leak information").
 */
export class NotFoundError extends AppError {
  constructor(code: string) {
    super(code, 404);
  }
}

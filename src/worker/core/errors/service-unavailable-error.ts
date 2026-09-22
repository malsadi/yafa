import { AppError } from './app-error';

/** 503: the portal is in maintenance mode (brief section 25 D6) — temporary, not a permission issue. */
export class ServiceUnavailableError extends AppError {
  constructor(code: string) {
    super(code, 503);
  }
}

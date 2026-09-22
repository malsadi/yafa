import { AppError } from './app-error';

/**
 * 409: a stale save — the `version` sent with the write doesn't match the
 * record's current one (brief section 9.1: "a stale save is rejected with
 * a clear 'someone else changed this' message").
 */
export class ConflictError extends AppError {
  constructor(code: string) {
    super(code, 409);
  }
}

import { AppError } from './app-error';

/** 429: more requests in a minute than the agreed rate limit allows (brief 12; D-217, O-163). */
export class TooManyRequestsError extends AppError {
  constructor(code: string) {
    super(code, 429);
  }
}

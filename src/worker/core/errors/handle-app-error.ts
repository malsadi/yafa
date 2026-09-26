import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { AppError } from './app-error';

/**
 * The Worker's single error boundary (T-018): every response is `{ error:
 * { code } }`, with any numbers the refusal states (D-108), never prose — the web app maps the code to text in the
 * officer's language. Registered once, on the assembled Hono app
 * (`app.onError(handleAppError)`), whenever `src/worker/index.ts` is built.
 * Logs only the error's name, never its message, stack or any request
 * data — no personal data in logs (brief section 12).
 */
export const handleAppError: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    const values = err.values ? { values: err.values } : {};
    return c.json({ error: { code: err.code, ...values } }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json({ error: { code: 'request.invalid' } }, 400);
  }

  console.error('unhandled error', err.name);
  return c.json({ error: { code: 'server.error' } }, 500);
};

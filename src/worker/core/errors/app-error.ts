import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * The base of every error the API deliberately throws (T-018): a stable
 * `code`, never prose — the web app maps the code to text in the officer's
 * language (`src/web/text/`). Thrown directly only through a subclass
 * (`ForbiddenError`, `NotFoundError`, ...), never on its own, so the status
 * is always explicit at the throw site.
 */
export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: ContentfulStatusCode,
    /** Numbers the refusal's text states plainly (D-108) — never prose, never personal data. */
    readonly values?: Record<string, number>,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

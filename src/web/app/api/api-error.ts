/** A refused API call, carrying the Worker's error code (T-018), never prose. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    /** Numbers the refusal's text states (D-108). */
    readonly values: Record<string, number> = {},
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

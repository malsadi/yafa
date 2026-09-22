/**
 * Built by the Clerk middleware for every request (brief section 6.3).
 * Nothing about permissions is cached between requests: this is always
 * freshly loaded, never reused across requests.
 */
export interface RequestContext {
  personId: string;
  units: readonly string[];
  roles: readonly string[];
  /** A UI hint only, not authoritative — see T-042. Use can() for a decision. */
  capabilities: readonly string[];
  isSystemAdmin: boolean;
}

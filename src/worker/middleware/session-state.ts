import type { RequestContext } from '../core/permissions';

/**
 * The outcomes for a signed-in officer (brief section 6.2/D-024):
 * `not-active` collapses "no linked person" and "no current term" (they
 * both show the same "access not active" page, per `loadRequestContext()`).
 * `notice-not-set` and `notice-not-acknowledged` are a separate, later gate
 * (D-005/D-024) — a person can be `active` per `loadRequestContext()` and
 * still be stopped here: `notice-not-set` when no privacy notice text has
 * ever been entered (D-024's bootstrap case — a different screen from
 * `notice-not-acknowledged`, which has a real notice to show and tick).
 */
export type SessionState =
  | { status: 'not-active' }
  | { status: 'second-factor-required'; personId: string }
  | { status: 'notice-not-set'; personId: string }
  | { status: 'notice-not-acknowledged'; personId: string; noticeVersionId: string }
  | { status: 'active'; context: RequestContext };

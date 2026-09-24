import { loadRequestContext } from '../core/permissions';
import { getCurrentPrivacyNoticeVersion, hasAcknowledgedVersion } from '../core/privacy-notice';
import type { SessionState } from './session-state';
import type { VerifiedSession } from './verify-clerk-session-token';

/**
 * Composes `core/permissions` and `core/privacy-notice` into the one
 * question a request actually needs answered: can this signed-in officer
 * proceed? D-027: system administrators are not exempt from either check —
 * `isSystemAdmin` never short-circuits anything here, matching `can()`'s
 * own rule (T-042) that it never trusts a flag over a real grant.
 */
export async function resolveSessionState(
  db: D1Database,
  session: VerifiedSession,
): Promise<SessionState> {
  const requestContext = await loadRequestContext(db, session.clerkUserId);
  if (requestContext.status === 'not-active') {
    return { status: 'not-active' };
  }

  const { personId, isSystemAdmin } = requestContext.context;
  // Brief 6.3: "System administrators always must" use multi-factor (T-077).
  if (isSystemAdmin && !session.secondFactorVerified) {
    return { status: 'second-factor-required', personId };
  }
  const currentNotice = await getCurrentPrivacyNoticeVersion(db);
  if (!currentNotice) {
    return { status: 'notice-not-set', personId };
  }

  const acknowledged = await hasAcknowledgedVersion(db, {
    personId,
    noticeVersionId: currentNotice.id,
  });
  if (!acknowledged) {
    return { status: 'notice-not-acknowledged', personId, noticeVersionId: currentNotice.id };
  }

  return { status: 'active', context: requestContext.context };
}

import { loadRequestContext } from '../core/permissions';
import { getCurrentPrivacyNoticeVersion, hasAcknowledgedVersion } from '../core/privacy-notice';
import type { SessionState } from './session-state';

/**
 * Composes `core/permissions` and `core/privacy-notice` into the one
 * question a request actually needs answered: can this signed-in officer
 * proceed? D-027: system administrators are not exempt from either check —
 * `isSystemAdmin` never short-circuits anything here, matching `can()`'s
 * own rule (T-042) that it never trusts a flag over a real grant.
 */
export async function resolveSessionState(
  db: D1Database,
  clerkUserId: string,
): Promise<SessionState> {
  const requestContext = await loadRequestContext(db, clerkUserId);
  if (requestContext.status === 'not-active') {
    return { status: 'not-active' };
  }

  const currentNotice = await getCurrentPrivacyNoticeVersion(db);
  if (!currentNotice) {
    return { status: 'notice-not-set' };
  }

  const acknowledged = await hasAcknowledgedVersion(db, {
    personId: requestContext.context.personId,
    noticeVersionId: currentNotice.id,
  });
  if (!acknowledged) {
    return { status: 'notice-not-acknowledged', noticeVersionId: currentNotice.id };
  }

  return { status: 'active', context: requestContext.context };
}

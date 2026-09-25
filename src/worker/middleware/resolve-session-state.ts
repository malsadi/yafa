import { loadRequestContext, type RequestContext } from '../core/permissions';
import { getCurrentPrivacyNoticeVersion, hasAcknowledgedVersion } from '../core/privacy-notice';
import type { SessionState } from './session-state';
import type { VerifiedSession } from './verify-clerk-session-token';
import { getSetting } from '../core/settings';

// Brief 6.3 and 14's setting, registered by the Committee register (T-100).
const ROLES_REQUIRING_MFA = 'committee-register.roles_requiring_mfa';

/**
 * Brief 6.3: "System administrators always must" use multi-factor (T-077),
 * and so must anyone holding a current term in a role the setting lists.
 * Until the setting is set, no role adds to the rule (T-100).
 */
async function mustUseSecondFactor(db: D1Database, context: RequestContext): Promise<boolean> {
  if (context.isSystemAdmin) return true;
  const roles = await getSetting<string[]>(db, ROLES_REQUIRING_MFA);
  return roles.status === 'configured' && context.roles.some((id) => roles.value.includes(id));
}

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

  const { personId } = requestContext.context;
  if (!session.secondFactorVerified && (await mustUseSecondFactor(db, requestContext.context))) {
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

import type { ServiceSlug } from '../core/services';
import type { AdminTextKey } from './admin-texts';

/**
 * The administrator's texts a service needs written before it can be
 * switched on (15 C6). D-086: the Communication hub needs the iPhone install
 * guide — phone notifications can't be on while iPhone users have no way to
 * enable them. A rule the owner set, not a setting.
 */
export const REQUIRED_ADMIN_TEXTS: Partial<Record<ServiceSlug, readonly AdminTextKey[]>> = {
  'communication-hub': ['iphone-install-guide'],
};

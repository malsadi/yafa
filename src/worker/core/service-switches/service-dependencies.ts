import type { ServiceSlug } from '../../../shared/core/services';

/**
 * Brief section 8.4 states exactly one dependency between stage-one
 * services. The full list is still needed from the owner before Phase 2
 * builds the switch-editing screen (O-005 remainder, docs/decisions.md).
 */
export const SERVICE_DEPENDENCIES: Partial<Record<ServiceSlug, readonly ServiceSlug[]>> = {
  'event-organiser': ['treasury'],
};

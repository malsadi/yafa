import type { ServiceSlug } from '../../../shared/core/services';

/**
 * Brief section 8.4 states exactly one dependency between stage-one
 * services, and D-049 confirms it is the only one: no others are invented.
 * A phase that finds a real one raises it with the owner first.
 */
export const SERVICE_DEPENDENCIES: Partial<Record<ServiceSlug, readonly ServiceSlug[]>> = {
  'event-organiser': ['treasury'],
};

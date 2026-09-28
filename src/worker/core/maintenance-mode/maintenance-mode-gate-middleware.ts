import type { MiddlewareHandler } from 'hono';
import { ServiceUnavailableError } from '../errors';
import { isMaintenanceModeOn } from './is-maintenance-mode-on';
import { MAINTENANCE_MODE_PATH } from './maintenance-mode-path';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Brief section 25 D6: while maintenance mode is on, the portal is
 * read-only. GET/HEAD/OPTIONS always pass; a mutating method is refused
 * with `maintenance-mode.read-only` (503) while it's on. Apply to every
 * mutating route **except** the one that switches maintenance mode
 * (`MAINTENANCE_MODE_PATH`), which it lets through — or the portal could
 * never leave maintenance mode once it entered it.
 */
export function maintenanceModeGate(db: D1Database): MiddlewareHandler {
  return async (c, next) => {
    const switching = c.req.path === MAINTENANCE_MODE_PATH;
    if (!switching && MUTATING_METHODS.has(c.req.method) && (await isMaintenanceModeOn(db))) {
      throw new ServiceUnavailableError('maintenance-mode.read-only');
    }
    await next();
  };
}

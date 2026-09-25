import type { ServiceSwitchesView } from '../../../../shared/administration-panel/service-switches';
import {
  SERVICES,
  SERVICES_THAT_CANNOT_BE_SWITCHED_OFF,
  type ServiceSlug,
} from '../../../../shared/core/services';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import {
  readAllServiceSwitchValues,
  SERVICE_DEPENDENCIES,
  setServiceSwitch,
} from '../../../core/service-switches';
import { listUnits } from '../../committee-register';

const CAPABILITY = 'administration-panel.service-switches.manage';

async function requireSwitchesCapability(db: D1Database, ctx: RequestContext) {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

function asService(slug: string): ServiceSlug {
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) throw new NotFoundError('service-switches.no-such-service');
  return service.slug;
}

/** Brief 25 C2: every service, what it needs, and every switch, portal-wide and per unit. */
export async function getServiceSwitches(
  db: D1Database,
  ctx: RequestContext,
): Promise<ServiceSwitchesView> {
  await requireSwitchesCapability(db, ctx);
  const [rows, units] = await Promise.all([readAllServiceSwitchValues(db), listUnits(db)]);
  return {
    services: SERVICES.map(({ slug }) => ({
      slug,
      alwaysOn: SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(slug),
      needs: [...(SERVICE_DEPENDENCIES[slug] ?? [])],
    })),
    rows,
    units: units.map(({ id, nameEn, nameAr }) => ({ id, nameEn, nameAr })),
  };
}

/**
 * Brief 25 C2 and 8.4: switch a service on or off portal-wide or for a
 * unit, or return a unit to the portal-wide value. The checks are the
 * core's (setServiceSwitch); switching never deletes data.
 */
export async function changeServiceSwitch(
  db: D1Database,
  ctx: RequestContext,
  params: { service: string; enabled: boolean | null; unitId?: string },
): Promise<void> {
  await requireSwitchesCapability(db, ctx);
  const service = asService(params.service);
  if (params.unitId && !(await listUnits(db)).some((u) => u.id === params.unitId)) {
    throw new NotFoundError('branches.not-found');
  }
  await setServiceSwitch(db, { ...params, service, actorPersonId: ctx.personId });
}

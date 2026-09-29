import type { Hono } from 'hono';
import type { ClerkAccounts } from '../clerk';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import { registerOperationsRoutes } from './register-operations-routes';
import {
  registerAccessCheckRoutes,
  registerBrandingRoutes,
  registerLetterheadPreviewRoutes,
  registerListsRoutes,
  registerNotificationsRoutes,
  registerOfficerAccountsRoutes,
  registerPermissionsMatrixRoutes,
  registerRoleDesignationsRoutes,
  registerServiceSettingsRoutes,
  registerServiceSwitchesRoutes,
  registerSetupChecklistRoutes,
  registerSystemAdministratorsRoutes,
  registerTextsRoutes,
} from '../services/administration-panel';

/** Service 15's routes (brief 25), each declaring its capability (7.4). */
export function registerAdministrationPanelRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  env: Env,
  keys: ClerkVerificationKeys,
  clerk: ClerkAccounts,
): void {
  const db = env.DB;
  registerSystemAdministratorsRoutes(app, db, keys);
  registerPermissionsMatrixRoutes(app, db, keys);
  registerRoleDesignationsRoutes(app, db, keys);
  registerOfficerAccountsRoutes(app, db, keys, clerk);
  registerListsRoutes(app, db, keys);
  registerAccessCheckRoutes(app, db, keys);
  registerSetupChecklistRoutes(app, db, keys);
  registerServiceSettingsRoutes(app, db, keys);
  registerServiceSwitchesRoutes(app, db, keys);
  registerNotificationsRoutes(app, db, keys);
  registerTextsRoutes(app, db, keys);
  registerBrandingRoutes(app, db, keys);
  registerLetterheadPreviewRoutes(app, db, keys, { browser: env.BROWSER });
  registerOperationsRoutes(app, env, keys);
}

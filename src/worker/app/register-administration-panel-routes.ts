import type { Hono } from 'hono';
import type { ClerkAccounts } from '../clerk';
import { readR2Access } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import { registerOperationsRoutes } from './register-operations-routes';
import {
  registerAccessCheckRoutes,
  registerBrandingFilesRoutes,
  registerBrandingRoutes,
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
  const storage = { bucket: env.FILES, access: () => readR2Access(env) };
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
  registerBrandingFilesRoutes(app, db, keys, storage, env.BROWSER);
  registerOperationsRoutes(app, env, keys);
}

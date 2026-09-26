import type { Hono } from 'hono';
import type { ClerkAccounts } from '../clerk';
import { readR2Access } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
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
import {
  registerFindingRoutes,
  registerUploadsRoutes,
  registerVersionsRoutes,
} from '../services/documents-archive';
import {
  registerCorrespondenceRoutes,
  registerResourceFilesRoutes,
  registerTemplatesAndGuidesRoutes,
  registerVenuesRoutes,
  registerLetterTemplatePreviewRoutes,
  registerLetterTemplatesRoutes,
} from '../services/resources-library';
import {
  registerBranchesRoutes,
  registerElectionsRoutes,
  registerHandoversRoutes,
  registerOfficersRoutes,
  registerRegisterUnitsRoutes,
  registerRolesRoutes,
} from '../services/committee-register';

/** Every route for active officers, each declaring its capability (brief 7.4). */
export function registerActiveRoutes(
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
  registerBranchesRoutes(app, db, keys);
  registerRegisterUnitsRoutes(app, db, keys);
  registerRolesRoutes(app, db, keys);
  registerOfficersRoutes(app, db, keys, clerk);
  registerHandoversRoutes(app, db, keys);
  registerElectionsRoutes(app, db, keys, clerk);
  registerFindingRoutes(app, db, keys, storage);
  registerUploadsRoutes(app, db, keys, storage);
  registerVersionsRoutes(app, db, keys, storage);
  registerLetterTemplatesRoutes(app, db, keys);
  registerLetterTemplatePreviewRoutes(app, db, keys, { bucket: env.FILES, browser: env.BROWSER });
  registerCorrespondenceRoutes(app, db, keys, storage);
  registerTemplatesAndGuidesRoutes(app, db, keys);
  registerResourceFilesRoutes(app, db, keys, storage);
  registerVenuesRoutes(app, db, keys);
}

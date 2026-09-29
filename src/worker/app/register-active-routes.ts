import type { Hono } from 'hono';
import type { ClerkAccounts } from '../clerk';
import { readR2Access } from '../core/files';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import { registerAdministrationPanelRoutes } from './register-administration-panel-routes';
import {
  registerFindingRoutes,
  registerUploadsRoutes,
  registerVersionsRoutes,
} from '../services/documents-archive';
import {
  registerCorrespondenceRoutes,
  registerEquipmentRoutes,
  registerResourceFilesRoutes,
  registerTemplatesAndGuidesRoutes,
  registerVenuesRoutes,
  registerLetterTemplatePreviewRoutes,
  registerLetterTemplatesRoutes,
  registerLoansRoutes,
} from '../services/resources-library';
import { registerTreasuryRoutes } from './register-treasury-routes';
import { registerInboxRoutes } from '../api-inbox';
import { registerMyTasksRoutes, registerTasksRoutes } from '../services/task-tracker';
import {
  registerCommunityDatesRoutes,
  registerFeedTokensRoutes,
  registerViewsRoutes,
} from '../services/calendar';
import { registerCommunicationHubRoutes } from './register-communication-hub-routes';
import { registerEventOrganiserRoutes } from './register-event-organiser-routes';
import { registerMeetingRecorderRoutes } from './register-meeting-recorder-routes';
import { registerCorrespondenceAndLettersRoutes } from './register-correspondence-and-letters-routes';
import { registerAchievementsAndReportsRoutes } from './register-achievements-and-reports-routes';
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
  const pdf = { browser: env.BROWSER };
  registerAdministrationPanelRoutes(app, env, keys, clerk);
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
  registerLetterTemplatePreviewRoutes(app, db, keys, pdf);
  registerCorrespondenceRoutes(app, db, keys, storage);
  registerTemplatesAndGuidesRoutes(app, db, keys);
  registerResourceFilesRoutes(app, db, keys, storage);
  registerVenuesRoutes(app, db, keys);
  registerEquipmentRoutes(app, db, keys);
  registerLoansRoutes(app, db, keys);
  registerTreasuryRoutes(app, db, keys, storage, pdf);
  registerInboxRoutes(app, db, keys);
  registerTasksRoutes(app, db, keys);
  registerMyTasksRoutes(app, db, keys);
  registerFeedTokensRoutes(app, db, keys);
  registerViewsRoutes(app, db, keys);
  registerCommunityDatesRoutes(app, db, keys);
  registerCommunicationHubRoutes(app, db, keys, env.NOTIFICATIONS_QUEUE, env.VAPID_PUBLIC_KEY);
  registerEventOrganiserRoutes(app, db, keys, env.NOTIFICATIONS_QUEUE, storage, pdf);
  registerMeetingRecorderRoutes(app, db, keys, {
    queue: env.NOTIFICATIONS_QUEUE,
    storage,
    pdf,
  });
  registerCorrespondenceAndLettersRoutes(app, db, keys, { storage, pdf });
  registerAchievementsAndReportsRoutes(app, db, keys, { storage, pdf });
}

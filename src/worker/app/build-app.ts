import { Hono } from 'hono';
import type { ClerkAccounts } from '../clerk';
import { registerGetMeRoute, registerSetMyLanguageRoute } from '../api-me';
import { handleAppError, NotFoundError } from '../core/errors';
import { maintenanceModeGate } from '../core/maintenance-mode';
import { requireSameOrigin, securityHeaders } from '../core/security-headers';
import type {
  ActiveAccessVariables,
  ClerkVerificationKeys,
  SignedInVariables,
} from '../middleware';
import {
  registerAccessCheckRoutes,
  registerListsRoutes,
  registerOfficerAccountsRoutes,
  registerPermissionsMatrixRoutes,
  registerRoleDesignationsRoutes,
  registerSetupChecklistRoutes,
  registerServiceSettingsRoutes,
  registerServiceSwitchesRoutes,
  registerNotificationsRoutes,
  registerSystemAdministratorsRoutes,
} from '../services/administration-panel';
import {
  registerBranchesRoutes,
  registerRegisterUnitsRoutes,
  registerElectionsRoutes,
  registerHandoversRoutes,
  registerOfficersRoutes,
  registerRolesRoutes,
} from '../services/committee-register';
import {
  registerAcknowledgePrivacyNoticeRoute,
  registerGetPrivacyNoticeRoute,
} from '../privacy-notice';
import { registerClerkWebhookRoute } from '../webhooks';
import { registerCatalogues } from './register-catalogues';
import { serveStaticAsset } from './serve-static-asset';

/**
 * Assembles every middleware and route in one place. Security headers wrap
 * every response, static assets included (T-066); the API accepts only
 * same-origin browser calls (T-013); maintenance mode makes every mutating
 * API call read-only (brief section 12). Any `/api/*` path no route claims
 * is a JSON 404, never the single-page app's `index.html`. `keys` is a
 * parameter so tests can verify self-signed tokens (T-064); `index.ts`, the
 * only production caller, always passes `CLERK_SECRET_KEY`.
 */
export function buildApp(env: Env, keys: ClerkVerificationKeys, clerk: ClerkAccounts): Hono {
  registerCatalogues();
  const app = new Hono();
  app.onError(handleAppError);
  app.use('*', securityHeaders(env.CLERK_PUBLISHABLE_KEY, { viteDevServer: import.meta.env.DEV }));
  app.use('/api/*', requireSameOrigin);
  app.use('/api/*', maintenanceModeGate(env.DB));

  const signedInRoutes = new Hono<{ Variables: SignedInVariables }>();
  registerGetMeRoute(signedInRoutes, env.DB, keys);
  registerSetMyLanguageRoute(signedInRoutes, env.DB, keys);
  registerGetPrivacyNoticeRoute(signedInRoutes, env.DB, keys);
  registerAcknowledgePrivacyNoticeRoute(signedInRoutes, env.DB, keys);
  app.route('/', signedInRoutes);

  const activeRoutes = new Hono<{ Variables: ActiveAccessVariables }>();
  registerSystemAdministratorsRoutes(activeRoutes, env.DB, keys);
  registerPermissionsMatrixRoutes(activeRoutes, env.DB, keys);
  registerRoleDesignationsRoutes(activeRoutes, env.DB, keys);
  registerOfficerAccountsRoutes(activeRoutes, env.DB, keys, clerk);
  registerListsRoutes(activeRoutes, env.DB, keys);
  registerAccessCheckRoutes(activeRoutes, env.DB, keys);
  registerSetupChecklistRoutes(activeRoutes, env.DB, keys);
  registerServiceSettingsRoutes(activeRoutes, env.DB, keys);
  registerServiceSwitchesRoutes(activeRoutes, env.DB, keys);
  registerNotificationsRoutes(activeRoutes, env.DB, keys);
  registerBranchesRoutes(activeRoutes, env.DB, keys);
  registerRegisterUnitsRoutes(activeRoutes, env.DB, keys);
  registerRolesRoutes(activeRoutes, env.DB, keys);
  registerOfficersRoutes(activeRoutes, env.DB, keys, clerk);
  registerHandoversRoutes(activeRoutes, env.DB, keys);
  registerElectionsRoutes(activeRoutes, env.DB, keys, clerk);
  app.route('/', activeRoutes);
  registerClerkWebhookRoute(app, env.DB, env.CLERK_WEBHOOK_SIGNING_SECRET);

  app.all('/api/*', () => {
    throw new NotFoundError('route.not-found');
  });
  app.all('*', (c) => serveStaticAsset(env.ASSETS, c.req.raw));
  return app;
}

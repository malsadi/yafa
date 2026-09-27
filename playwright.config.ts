import { defineConfig, devices } from '@playwright/test';

// Brief section 27/28: end-to-end journeys, each run in English and in
// Arabic. They need the Clerk development keys in .dev.vars/.env.local, so
// they are not part of the CI verify job.
//
// T-149: the journeys run against their own dev server (a port of their
// own), on a local database made afresh for each run — the fictional world
// in scripts/e2e — never the owner's local data. One worker: the journeys
// share that database and one of them changes a portal-wide setting.
const PORT = 5174;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.test.ts',
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  use: { baseURL: `http://localhost:${String(PORT)}` },
  webServer: {
    command: `node scripts/e2e/prepare-e2e-db.ts && vite dev --port ${String(PORT)} --strictPort`,
    // CI=1: Miniflare then starts the local Chrome without its sandbox, which
    // this machine's Linux blocks (T-149). Only for the tests' own server.
    env: { CLOUDFLARE_ENV: 'e2e', E2E_STATE_DIR: '.wrangler/e2e-state', CI: '1' },
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
  projects: [
    { name: 'sign-in', testMatch: '**/sign-in.setup.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'english',
      use: { ...devices['Desktop Chrome'], locale: 'en-GB' },
      dependencies: ['sign-in'],
    },
    {
      name: 'arabic',
      use: { ...devices['Desktop Chrome'], locale: 'ar' },
      dependencies: ['sign-in'],
    },
  ],
});

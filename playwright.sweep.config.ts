import { defineConfig, devices } from '@playwright/test';

// D-226: the screen sweep — every screen, in both languages, on a computer
// and a phone, as a test administrator holding every capability. Its own
// run (`npm run test:e2e:sweep`) and port, on the browser tests' own fresh
// local database (T-149); the journeys' config never runs it.
const PORT = 5175;
const ADMINISTRATOR = 'playwright/.auth/administrator.json';
const PHONE = { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true };

export default defineConfig({
  testDir: 'tests/e2e-sweep',
  testMatch: '**/*.test.ts',
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  use: { baseURL: `http://localhost:${String(PORT)}` },
  webServer: {
    command: `node scripts/e2e/prepare-e2e-db.ts && vite dev --port ${String(PORT)} --strictPort`,
    env: { CLOUDFLARE_ENV: 'e2e', E2E_STATE_DIR: '.wrangler/e2e-state', CI: '1' },
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
  projects: [
    {
      name: 'sign-in',
      testDir: 'tests/e2e',
      testMatch: '**/sign-in.setup.ts',
      grep: /administrator/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'grants',
      testMatch: '**/grant-everything.setup.ts',
      dependencies: ['sign-in'],
    },
    ...(
      [
        ['english', 'en-GB', {}],
        ['arabic', 'ar', {}],
        ['english-phone', 'en-GB', PHONE],
        ['arabic-phone', 'ar', PHONE],
      ] as const
    ).map(([name, locale, size]) => ({
      name,
      use: { ...devices['Desktop Chrome'], ...size, locale, storageState: ADMINISTRATOR },
      dependencies: ['grants'],
    })),
  ],
});

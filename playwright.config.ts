import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;

// Brief section 27/28: end-to-end journeys, each run in English and in
// Arabic. Runs against the local dev server (`npm run test:e2e`); it needs
// the Clerk development keys in .dev.vars/.env.local, so it is not part of
// the CI verify job.
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.test.ts',
  use: { baseURL: `http://localhost:${String(PORT)}` },
  webServer: {
    command: `vite dev --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'english', use: { ...devices['Desktop Chrome'], locale: 'en-GB' } },
    { name: 'arabic', use: { ...devices['Desktop Chrome'], locale: 'ar' } },
  ],
});

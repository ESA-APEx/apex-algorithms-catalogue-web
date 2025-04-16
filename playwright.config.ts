import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './playwright-global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [[process.env.CI ? 'github' : 'line'], ['html']],
  use: {
    baseURL: 'http://localhost:4321/',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node ./dist/server/entry.mjs',
    url: 'http://localhost:4321/',
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});

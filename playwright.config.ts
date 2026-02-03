import * as dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [[process.env.CI ? "github" : "line"], ["html"]],
  use: {
    baseURL: "http://localhost:4321/",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node ./dist/server/entry.mjs",
    url: "http://localhost:4321/",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});

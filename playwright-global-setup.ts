import * as dotenv from "dotenv";
import type { FullConfig } from "@playwright/test";
import { test } from '@playwright/test';
import benchmarkData from './tests/fixtures/benchmark.json';

dotenv.config();

const globalSetup = async (_config: FullConfig): Promise<void> => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/benchmarks.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(benchmarkData),
      });
    });
  });
};

export default globalSetup;

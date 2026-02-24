import base from "@playwright/test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const getFixturesDir = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, "../fixtures");
};
const readFixture = (filename: string) => {
  return JSON.parse(readFileSync(join(getFixturesDir(), filename), "utf-8"));
};

const defaultBenchmark = readFixture("benchmarks.json");

export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    async ({ page }, use) => {
      await page.route("api/services/benchmarks.json", (route) => {
        return route.fulfill({
          json: defaultBenchmark,
        });
      });

      await page.route(
        "api/services/max_ndvi_composite/benchmarks.json",
        (route) => {
          return route.fulfill({
            json: readFixture("/benchmarks/max_ndvi_composite.json"),
          });
        },
      );

      await use();
    },
    { auto: true },
  ], // automatically starts for every test.
});

export { expect } from "@playwright/test";

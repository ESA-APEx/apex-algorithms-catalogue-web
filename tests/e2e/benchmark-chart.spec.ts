import { expect, type Page, test } from "@playwright/test";

const setupBasicAuth = async (page: Page) => {
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  await page.setExtraHTTPHeaders({
    Authorization: `Basic ${credentials}`,
  });
};

const TEST_SCENARIO_ID = "max_ndvi_composite";

test.describe("Benchmark Chart Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupBasicAuth(page);
  });

  test.describe("Page Structure and Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/dashboard/scenarios/${TEST_SCENARIO_ID}?start=2025-09-01&end=2025-11-30`,
        {
          waitUntil: "networkidle",
        },
      );
    });

    test("Should display title", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: TEST_SCENARIO_ID }),
      ).toBeVisible();
    });

    test("Should display date filter controls", async ({ page }) => {
      await expect(page.getByLabel("From")).toBeVisible();
      await expect(page.getByLabel("To")).toBeVisible();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
    });
  });

  test.describe("Benchmark Statistics Display", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/dashboard/scenarios/${TEST_SCENARIO_ID}?start=2025-09-01&end=2025-11-30`,
        {
          waitUntil: "networkidle",
        },
      );
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should display benchmark summary statistics", async ({ page }) => {
      await expect(page.getByText("Total Runs")).toBeVisible();
      await expect(page.getByText("Successful Runs")).toBeVisible();
      await expect(page.getByText("Failed Runs")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();

      const statsValues = page.locator(".text-6xl");
      const statsCount = await statsValues.count();
      expect(statsCount).toBeGreaterThanOrEqual(3); // At least Total, Success, Failed

      for (let i = 0; i < Math.min(statsCount, 3); i++) {
        const statValue = await statsValues.nth(i).textContent();
        expect(statValue).toMatch(/^\d+$/); // Should be a number
      }
    });

    test("Should display benchmark status badge", async ({ page }) => {
      await expect(page.getByTestId("benchmark-status-badge")).toBeVisible();
    });
  });

  test.describe("Metrics Table Display", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/dashboard/scenarios/${TEST_SCENARIO_ID}?start=2025-09-01&end=2025-11-30`,
        {
          waitUntil: "networkidle",
        },
      );
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should display benchmark metrics summary table", async ({ page }) => {
      await expect(page.locator("table")).toBeVisible();

      await expect(page.getByText("Metric")).toBeVisible();
      await expect(page.getByText("Minimum")).toBeVisible();
      await expect(page.getByText("Maximum")).toBeVisible();
      await expect(page.getByText("Average")).toBeVisible();
      await expect(page.getByText("Total")).toBeVisible();
    });

    test("Should display all expected metrics in table", async ({ page }) => {
      await expect(page.getByText("CPU Usage")).toBeVisible();
      await expect(page.getByText("Memory Usage")).toBeVisible();
      await expect(page.getByText("Duration")).toBeVisible();
      await expect(page.getByText(/Credits/)).toBeVisible();
    });
  });

  test.describe("Charts Display", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/dashboard/scenarios/${TEST_SCENARIO_ID}?start=2025-09-01&end=2025-11-30`,
        {
          waitUntil: "networkidle",
        },
      );
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should display all four metric charts", async ({ page }) => {
      await page.waitForSelector("canvas", { timeout: 10000 });

      const canvasElements = page.locator("canvas");
      const canvasCount = await canvasElements.count();
      expect(canvasCount).toBe(4); // CPU, Memory, Duration, Credits

      for (let i = 0; i < canvasCount; i++) {
        await expect(canvasElements.nth(i)).toBeVisible();
      }
    });
  });

  test.describe("Date Filtering Functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/dashboard/scenarios/${TEST_SCENARIO_ID}`, {
        waitUntil: "networkidle",
      });
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should allow setting custom date filters", async ({ page }) => {
      const startDateInput = page.getByLabel("From");
      const endDateInput = page.getByLabel("To");
      const applyButton = page.getByRole("button", { name: "Apply" });

      await startDateInput.fill("2024-01-01");
      await endDateInput.fill("2024-12-31");

      await applyButton.click();

      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });

      const url = new URL(page.url());
      expect(url.searchParams.get("start")).toBe("2024-01-01");
      expect(url.searchParams.get("end")).toBe("2024-12-31");
    });

    test("Should preserve date filters in URL and reload correctly", async ({
      page,
    }) => {
      await page.goto(
        `/dashboard/scenarios/${TEST_SCENARIO_ID}?start=2024-06-01&end=2024-06-30`,
      );

      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });

      const startDateInput = page.getByLabel("From");
      const endDateInput = page.getByLabel("To");

      await expect(startDateInput).toHaveValue("2024-06-01");
      await expect(endDateInput).toHaveValue("2024-06-30");
    });
  });
});

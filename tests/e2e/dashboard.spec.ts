import { expect, type Page, test } from "@playwright/test";

const setupBasicAuth = async (page: Page) => {
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  await page.setExtraHTTPHeaders({
    Authorization: `Basic ${credentials}`,
  });
};

test.describe("Dashboard Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupBasicAuth(page);
  });

  test.describe("Authentication", () => {
    test("Should require basic auth to access dashboard page", async ({
      page,
    }) => {
      await page.setExtraHTTPHeaders({});

      const response = await page.goto("/dashboard", {
        waitUntil: "networkidle",
      });
      expect(response?.status()).toBe(401);
    });

    test("Should allow access with correct basic auth credentials", async ({
      page,
    }) => {
      const response = await page.goto("/dashboard", {
        waitUntil: "networkidle",
      });
      expect(response?.status()).toBe(200);

      await expect(page).toHaveURL(/dashboard/);
      await expect(page).toHaveTitle(/Algorithm Services Catalogue/);
    });
  });

  test.describe("Dashboard Content", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" });
    });

    test("Should display the dashboard with benchmark table", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: /Benchmark Results/i }),
      ).toBeVisible();

      await expect(page.getByLabel("From")).toBeVisible();
      await expect(page.getByLabel("To")).toBeVisible();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();

      await page.waitForSelector("table", { timeout: 10000 });
      await expect(page.locator("table")).toBeVisible();
    });

    test("Should display table headers correctly", async ({ page }) => {
      await page.waitForSelector("th", { timeout: 10000 });

      await expect(page.getByText("Scenario ID")).toBeVisible();
      await expect(page.getByText("Total Runs")).toBeVisible();
      await expect(page.getByText("Success")).toBeVisible();
      await expect(page.getByText("Failed")).toBeVisible();
      await expect(page.getByText("Last Test")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();
    });

    test("Should load and display benchmark data", async ({ page }) => {
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });

      const tableRows = page.locator("tbody tr");
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0);

      if (rowCount > 0) {
        const firstRow = tableRows.first();
        const cells = firstRow.locator("td");
        const cellCount = await cells.count();
        expect(cellCount).toBe(6); // scenario_id, runs, success, failed, last_test, status

        const scenarioId = await cells.first().textContent();
        expect(scenarioId).toBeTruthy();
        expect(scenarioId?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Date Filtering", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should allow setting date filters", async ({ page }) => {
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

    test("Should preserve date filters in URL", async ({ page }) => {
      await page.goto("/dashboard?start=2024-06-01&end=2024-06-30");

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

  test.describe("Table Functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="spinner"]', {
        state: "hidden",
        timeout: 15000,
      });
    });

    test("Should support column sorting", async ({ page }) => {
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      const sortableHeaders = page
        .locator("th")
        .filter({ hasText: /Scenario ID|Total Runs|Success|Failed|Last Test/ });
      const headerCount = await sortableHeaders.count();

      if (headerCount > 0) {
        await sortableHeaders.first().click();

        await expect(page.locator("th").filter({ hasText: /▴|▾/ })).toBeVisible(
          { timeout: 5000 },
        );
      }
    });

    test("Should support filtering by scenario ID", async ({ page }) => {
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      const firstScenarioId = await page
        .locator("tbody tr:first-child td:first-child")
        .textContent();

      if (firstScenarioId && firstScenarioId.trim()) {
        const filterInput = page.getByPlaceholder("Search scenario...");
        await expect(filterInput).toBeVisible();

        await filterInput.fill(firstScenarioId.trim());

        await page.waitForTimeout(500);

        const visibleRows = page.locator("tbody tr:visible");
        const rowCount = await visibleRows.count();

        if (rowCount > 0) {
          for (let i = 0; i < rowCount; i++) {
            const cellText = await visibleRows
              .nth(i)
              .locator("td:first-child")
              .textContent();
            expect(cellText).toContain(firstScenarioId.trim());
          }
        }
      }
    });

    test("Should display benchmark status badges", async ({ page }) => {
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      const statusCells = page.locator("tbody tr td:last-child");
      const cellCount = await statusCells.count();

      if (cellCount > 0) {
        const firstStatusCell = statusCells.first();

        await expect(
          firstStatusCell.locator('[data-testid="benchmark-status-badge"]'),
        ).toBeVisible();
        await expect(
          firstStatusCell.locator("text=/\\(\\d+\\.?\\d*%\\)/"),
        ).toBeVisible();
      }
    });
  });
});

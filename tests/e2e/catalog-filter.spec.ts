import { test, expect } from "@playwright/test";

test.describe("URL Filter Persistence Tests", () => {
  const getAlgorithmCount = async (page: any) => {
    const resultsText = await page.getByText("Showing").textContent();
    const totalMatch = resultsText?.match(/of (\d+) algorithms/);
    return totalMatch ? parseInt(totalMatch[1]) : 0;
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Should persist search query to URL and load from URL", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: /Search algorithms/i }).fill("ESA");
    await page.waitForTimeout(500);

    expect(page.url()).toContain("q=ESA");

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("ESA");

    const cards = page.getByTestId("service-card");
    await expect(cards.first()).toBeVisible();
  });

  test("Should persist multiple filters to URL and load from URL", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("test");

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Last updated" }).click();

    await page.getByRole("button").getByText("Filter").click();
    const typeFilter = page.getByTestId("filter-type-item").first();
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    const licenseFilter = page.getByTestId("filter-license-item").first();
    await licenseFilter.scrollIntoViewIfNeeded();
    await licenseFilter.click();

    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).toContain("q=test");
    expect(url).toContain("sort=last%20updated");
    expect(url).toMatch(/types=[^&]+/);
    expect(url).toMatch(/licenses=[^&]+/);

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("test");
    await expect(page.getByRole("combobox")).toHaveText("Last updated");
    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("2"),
    ).toBeVisible();
  });

  test("Should clear URL params when filters are reset", async ({ page }) => {
    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("test");
    await page.getByRole("button").getByText("Filter").click();
    const typeFilter = page.getByTestId("filter-type-item").first();
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain("q=test");
    expect(page.url()).toMatch(/types=[^&]+/);

    await page.getByRole("button", { name: "Reset" }).click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain("q=test");
    expect(page.url()).not.toMatch(/types=[^&]+/);
  });

  test("Should handle invalid URL parameters gracefully", async ({ page }) => {
    await page.goto("/?sort=invalid&types=nonexistent");
    await page.waitForTimeout(500);

    await expect(page.getByTestId("apps")).toBeVisible();

    await expect(page.getByRole("combobox")).toHaveText("Name");

    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).not.toBeVisible();
  });

  test("Should preserve URL params when navigating with filters", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("search");
    await page.getByRole("button").getByText("Filter").click();
    const typeFilter = page.getByTestId("filter-type-item").first();
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const urlWithFilters = page.url();
    expect(urlWithFilters).toContain("q=search");
    expect(urlWithFilters).toMatch(/types=[^&]+/);

    const firstCard = page.getByTestId("service-card").first();
    await firstCard.click();

    await page.goBack();

    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("search");
    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).toBeVisible();
  });

  test("Should handle URL encoding of special characters in filters", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("test & encode");
    await page.waitForTimeout(500);

    expect(page.url()).toContain("q=test%20%26%20encode");

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("test & encode");
  });

  test("Should remove empty filters from URL", async ({ page }) => {
    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("test");
    await page.getByRole("button").getByText("Filter").click();
    const typeFilter = page.getByTestId("filter-type-item").first();
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain("q=test");
    expect(page.url()).toMatch(/types=[^&]+/);

    await page.getByRole("textbox", { name: /Search algorithms/i }).clear();
    await page.waitForTimeout(500);

    expect(page.url()).not.toContain("q=");
    expect(page.url()).toMatch(/types=[^&]+/); // Type filter should remain

    await page.getByRole("button").getByText("Filter").click();
    await typeFilter.click(); // Uncheck
    await page.waitForTimeout(500);

    expect(page.url()).not.toMatch(/types=[^&]+/);
    expect(page.url()).not.toContain("q=");
  });

  test("Should apply the type filtering", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    const initialTotal = await getAlgorithmCount(page);

    await page.getByRole("button").getByText("Filter").click();

    const openEOFilter = page
      .getByTestId("filter-type-item")
      .getByText("openEO");
    await openEOFilter.scrollIntoViewIfNeeded();
    await openEOFilter.click();

    await page.waitForTimeout(500);

    const openEOTotal = await getAlgorithmCount(page);
    expect(openEOTotal).toBeLessThan(initialTotal);

    const visibleTypes = await page
      .getByTestId("service-type")
      .allTextContents();
    visibleTypes.forEach((type) => expect(type).toBe("openEO"));

    await openEOFilter.click();
    await page.waitForTimeout(500);

    const afterRemoveTotal = await getAlgorithmCount(page);
    expect(afterRemoveTotal).toBeGreaterThan(openEOTotal);

    const ogcFilter = page
      .getByTestId("filter-type-item")
      .getByText("OGC API Process");
    await ogcFilter.scrollIntoViewIfNeeded();
    await ogcFilter.click();

    await page.waitForTimeout(500);

    const ogcTotal = await getAlgorithmCount(page);
    expect(ogcTotal).toBeLessThan(initialTotal);

    const ogcVisibleTypes = await page
      .getByTestId("service-type")
      .allTextContents();
    ogcVisibleTypes.forEach((type) => expect(type).toBe("OGC API Process"));

    await ogcFilter.click();
    await page.waitForTimeout(500);

    const finalTotal = await getAlgorithmCount(page);
    expect(finalTotal).toBeGreaterThan(ogcTotal);
  });
});

import { expect, type Page } from "@playwright/test";
import { test } from "./utils.ts";

test.describe("Catalog Filter Tests", () => {
  const openFilters = async (page: Page) => {
    const filterButton = page.getByRole("button", { name: /^Filter/ });
    await filterButton.evaluate((button) =>
      button.scrollIntoView({ block: "start" }),
    );
    await filterButton.click();
  };

  const getAlgorithmCount = async (page: any) => {
    const resultsText = await page.getByText("Showing").textContent();
    const totalMatch = resultsText?.match(/of (\d+) algorithms/);
    return totalMatch ? parseInt(totalMatch[1]) : 0;
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.skip("Should persist search query to URL and load from URL", async ({
    page,
  }) => {
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("ESA");

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
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("ESA");

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Last updated" }).click();

    await openFilters(page);
    const typeFilter = page
      .getByTestId("filter-type-item")
      .filter({ hasText: "openEO" })
      .getByRole("checkbox");
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    const licenseFilter = page
      .getByTestId("filter-license-item")
      .filter({ hasText: "Apache-2.0" })
      .getByRole("checkbox");
    await licenseFilter.scrollIntoViewIfNeeded();
    await licenseFilter.click();

    await expect(page).toHaveURL(/q=ESA/);
    await expect(page).toHaveURL(/sort=last\+updated/);
    await expect(page).toHaveURL(/types=[^&]+/);
    await expect(page).toHaveURL(/licenses=[^&]+/);

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("ESA");
    await expect(page.getByRole("combobox")).toHaveText("Last updated");
    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("2"),
    ).toBeVisible();
  });

  test("Should clear URL params when filters are reset", async ({ page }) => {
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("ESA");
    await openFilters(page);

    const typeFilter = page
      .getByTestId("filter-type-item")
      .filter({ hasText: "openEO" })
      .getByRole("checkbox");
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    await expect(page).toHaveURL(/q=ESA/);
    await expect(page).toHaveURL(/types=[^&]+/);

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(page).toHaveURL(/q=ESA/);
    await expect(page).not.toHaveURL(/types=[^&]+/);
  });

  test("Should handle invalid URL parameters gracefully", async ({ page }) => {
    await page.goto("/?sort=invalid&types=nonexistent");

    await expect(page.getByTestId("apps")).toBeVisible();

    await expect(page.getByRole("combobox")).toHaveText("Name");

    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).not.toBeVisible();
  });

  test("Should preserve URL params when navigating with filters", async ({
    page,
  }) => {
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("ESA");
    await openFilters(page);

    const typeFilter = page
      .getByTestId("filter-type-item")
      .filter({ hasText: "openEO" })
      .getByRole("checkbox");
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/q=ESA/);
    await expect(page).toHaveURL(/types=[^&]+/);

    const firstCard = await page.getByTestId("service-card").first();
    await firstCard.click();

    await page.goBack();

    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("ESA");
    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).toBeVisible();
  });

  test("Should handle URL encoding of special characters in filters", async ({
    page,
  }) => {
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("test & encode");

    await expect(page).toHaveURL(/q=test\+%26\+encode/);

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Search algorithms/i }),
    ).toHaveValue("test & encode");
  });

  test("Should remove empty filters from URL", async ({ page }) => {
    const textbox = await page.getByRole("textbox", { name: /Search algorithms/i });
    await textbox.fill("ESA");
    await openFilters(page);

    const typeFilter = page
      .getByTestId("filter-type-item")
      .filter({ hasText: "openEO" })
      .getByRole("checkbox");
    await typeFilter.scrollIntoViewIfNeeded();
    await typeFilter.click();

    await expect(page).toHaveURL(/q=ESA/);
    await expect(page).toHaveURL(/types=[^&]+/);

    await textbox.clear();

    await expect(page).not.toHaveURL(/q=/);
    await expect(page).toHaveURL(/types=[^&]+/); // Type filter should remain

    await openFilters(page);
    await typeFilter.click(); // Uncheck

    await expect(page).not.toHaveURL(/types=[^&]+/);
    await expect(page).not.toHaveURL(/q=/);
  });

  test("Should apply the type filtering", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    const initialTotal = await getAlgorithmCount(page);

    await openFilters(page);

    const openEOFilter = await page
      .getByTestId("filter-type-item")
      .filter({ hasText: "openEO" })
      .getByRole("checkbox");
    await openEOFilter.scrollIntoViewIfNeeded();
    await openEOFilter.click();

    const openEOTotal = await getAlgorithmCount(page);
    expect(openEOTotal).toBeLessThan(initialTotal);

    const visibleTypes = await page
      .getByTestId("service-type")
      .allTextContents();
    visibleTypes.forEach((type) => expect(type).toBe("openEO"));

    await openEOFilter.click();

    const afterRemoveTotal = await getAlgorithmCount(page);
    expect(afterRemoveTotal).toBeGreaterThan(openEOTotal);

    const ogcFilter = await page
      .getByTestId("filter-type-item")
      .filter({ hasText: "OGC API Process" })
      .getByRole("checkbox");
    await ogcFilter.scrollIntoViewIfNeeded();
    await ogcFilter.click();

    const ogcTotal = await getAlgorithmCount(page);
    expect(ogcTotal).toBeLessThan(initialTotal);

    const ogcVisibleTypes = await page
      .getByTestId("service-type")
      .allTextContents();
    ogcVisibleTypes.forEach((type) => expect(type).toBe("OGC API Process"));

    await ogcFilter.click();

    const finalTotal = await getAlgorithmCount(page);
    expect(finalTotal).toBeGreaterThan(ogcTotal);
  });

  test("Should filter by certification and persist it in the URL", async ({
    page,
  }) => {
    await openFilters(page);

    const contributedFilter = page
      .getByTestId("filter-certification-item")
      .filter({ hasText: "Community" });
    await contributedFilter.scrollIntoViewIfNeeded();
    await contributedFilter.getByRole("checkbox").click();

    await expect(page).toHaveURL(/certification=contributed/);

    await page.reload();
    await openFilters(page);
    await expect(
      page
        .getByTestId("filter-certification-item")
        .filter({ hasText: "Community" })
        .getByRole("checkbox"),
    ).toHaveAttribute("data-state", "checked");
  });

  test.skip("Should persist pagination to URL and load from URL", async ({
    page,
  }) => {
    await expect(page.getByTestId("pagination")).toBeVisible();

    await page.getByTestId("pagination-next").click();

    expect(page.url()).toContain("page=2");

    await expect(page.getByTestId("pagination-page-2")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.reload();
    await expect(page.getByTestId("pagination-page-2")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test.skip("Should reset page to 1 when filters change but preserve pagination in URL", async ({
    page,
  }) => {
    const pagination = page.getByTestId("pagination");
    if (await pagination.isVisible()) {
      await page.getByTestId("pagination-next").click();

      const textbox = await page
        .getByRole("textbox", { name: /Search algorithms/i });
      await textbox.fill("test");

      await expect(page.getByTestId("pagination-page-1")).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("Should handle invalid page numbers gracefully", async ({ page }) => {
    await page.goto("/?page=9999");

    /*
    Commented out due to race condition: https://github.com/ESA-APEx/apex-algorithms-catalogue-web/issues/76
    await page.waitForFunction(
      () => !window.location.search.includes("page=9999"),
    );
    */

    const pagination = page.getByTestId("pagination");
    if (await pagination.isVisible()) {
      await expect(page.getByTestId("pagination-page-1")).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("Should apply provider filtering", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    const initialTotal = await getAlgorithmCount(page);

    await openFilters(page);

    const providerInput = page.getByPlaceholder("Select providers");
    await providerInput.scrollIntoViewIfNeeded();
    await providerInput.click();

    const providerOption = page.getByRole("option").first();
    await expect(providerOption).toBeVisible();
    const provider = (await providerOption.innerText()).trim();
    expect(provider).not.toBe("");
    await providerOption.click();

    await expect.poll(() => new URL(page.url()).searchParams.get("providers"))
      .toBe(provider);
    const filteredTotal = await getAlgorithmCount(page);
    expect(filteredTotal).toBeLessThanOrEqual(initialTotal);

    await page.reload();

    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).toBeVisible();

    const reloadedTotal = await getAlgorithmCount(page);
    expect(reloadedTotal).toBe(filteredTotal);

    await openFilters(page);
    await page
      .getByRole("button", { name: `Remove ${provider} option`, exact: true })
      .click();

    await expect(page).not.toHaveURL(/[?&]providers=/);
    const resetTotal = await getAlgorithmCount(page);
    expect(resetTotal).toBeGreaterThanOrEqual(filteredTotal);
  });

  test("Should apply platform filtering", async ({ page }) => {
    const platform = "CDSE openEO Federation processing backend";
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    const initialTotal = await getAlgorithmCount(page);

    await openFilters(page);

    const platformInput = page.getByPlaceholder("Select platforms");
    await platformInput.scrollIntoViewIfNeeded();
    await platformInput.click();

    await page.getByRole("option", { name: platform, exact: true }).click();

    await expect.poll(() => new URL(page.url()).searchParams.get("platforms"))
      .toBe(platform);
    const filteredTotal = await getAlgorithmCount(page);
    expect(filteredTotal).toBeLessThanOrEqual(initialTotal);

    await page.reload();

    await expect(
      page.getByRole("button").getByText("Filter").locator("..").getByText("1"),
    ).toBeVisible();

    const reloadedTotal = await getAlgorithmCount(page);
    expect(reloadedTotal).toBe(filteredTotal);

    await openFilters(page);
    await page
      .getByRole("button", { name: `Remove ${platform} option`, exact: true })
      .click();

    await expect(page).not.toHaveURL(/[?&]platforms=/);
    const resetTotal = await getAlgorithmCount(page);
    expect(resetTotal).toBeGreaterThanOrEqual(filteredTotal);
  });
});
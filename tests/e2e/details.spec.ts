import { expect, type Page, test } from "@playwright/test";

const openService = async (page: Page, name: string) => {
  await page.getByTestId("service-card").getByText(name).first().click();
};

test.describe("Service Details Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Should open the details page", async ({ page }) => {
    await openService(page, "ESA worldcereal global crop type detector");
    await page.waitForURL("**/apps/worldcereal_crop_type");
  });

  test("Should show the correct links for an openEO service", async ({
    page,
  }) => {
    await openService(page, "Multi output gaussian process regression");

    await expect(
      page.getByRole("link").getByText("Open documentation"),
    ).toHaveAttribute("href", "https://open-eo.github.io/FuseTS/");
    await expect(
      page.getByRole("link").getByText("Show code repository"),
    ).toHaveAttribute(
      "href",
      "https://github.com/VITObelgium/openeo_algorithm_catalog",
    );
    await expect(
      page.getByRole("link").getByText("Execute service"),
    ).toHaveAttribute(
      "href",
      "https://editor.openeo.org/?wizard=UDP&wizard~process=mogpr_s1s2&wizard~processUrl=https://raw.githubusercontent.com/VITObelgium/openeo_algorithm_catalog/refs/heads/main/mogpr_s1s2/openeo_udp/mogpr_s1s2.json&server=https://openeofed.dataspace.copernicus.eu",
    );
  });

  test("Should show the correct links for an OGC API Process service", async ({
    page,
  }) => {
    await openService(page, "Burned Area Severity (BAS) analysis");

    await expect(
      page.getByRole("link").getByText("Open documentation"),
    ).toHaveAttribute(
      "href",
      "https://geohazards-tep.gitlab.io/gep-docs/services/burned-area-severity/service-specs/",
    );
    await expect(
      page.getByRole("link").getByText("Request access"),
    ).toHaveAttribute("href", "https://geohazards-tep.eu/#!web_store");
    await expect(
      page.getByRole("link").getByText("Execute service"),
    ).toHaveAttribute(
      "href",
      "https://geohazards-tep.eu/geobrowser/?id=opt-bas-app",
    );
  });

  test("Should show warning for restricted OGC API Process services", async ({
    page,
  }) => {
    await openService(page, "Burned Area Severity (BAS) analysis");

    await expect(page.getByTestId("service-access-warning")).toBeVisible();
  });

  test("Should not show warning for openEO services", async ({ page }) => {
    await openService(page, "Multi output gaussian process regression");

    await expect(page.getByTestId("service-access-warning")).not.toBeVisible();
  });

  test("Should show benchmark status", async ({ page }) => {
    await openService(page, "Max NDVI Composite based on Sentinel-2 data");

    await expect(page.getByText("Benchmark status")).toBeVisible();

    const statusBadge = page.getByTestId("benchmark-status-sidenav");

    await expect(statusBadge).toBeVisible();

    const statusBadgeLabel = statusBadge.getByText("Stable");

    await statusBadgeLabel.waitFor({ state: "visible", timeout: 50000 });
    await expect(statusBadgeLabel).toBeVisible({ timeout: 50000 });
  });

  test("Should truncate the lengthy description and display 'read more' to show complete text", async ({
    page,
  }) => {
    await openService(page, "Multi output gaussian process regression");

    const desc = page.getByTestId("collapsible-text");
    await expect(desc).toContainText("...");

    const readMoreButton = desc.getByRole("button");
    await readMoreButton.click();

    await expect(desc).not.toContainText("...");
    await expect(readMoreButton).not.toBeVisible();
  });

  test("Should show parameters in the details page for OpenEO service", async ({
    page,
  }) => {
    await openService(page, "ESA worldcereal global crop extent detector");

    const parametersTable = page.getByTestId("parameters-table");
    await expect(parametersTable).toBeVisible();

    const rows = parametersTable.locator("tr");
    await expect(rows).toHaveCount(6);

    // Check if the first row contains header information
    const headerCells = rows.first().locator("th");
    await expect(headerCells.nth(0)).toHaveText("Parameter");
    await expect(headerCells.nth(1)).toHaveText("Type");
    await expect(headerCells.nth(2)).toHaveText("Default");

    // Check if the content rows contain parameter information
    const contentCells = rows.nth(1).locator("td");
    await expect(contentCells.nth(0)).toContainText(
      "spatial_extent (required)",
    );
    await expect(contentCells.nth(1)).toHaveText("object/bounding-box");
    await expect(contentCells.nth(2)).toHaveText("");
  });

  // Skipped test due to no public OGC API Process service with parameters shown in the details page
  test.skip("Should show parameters in the details page for public OGC API Process service", async ({
    page,
  }) => {
    // Note: This test is working because the application url is patched for the test.
    // Adjusting reference to the application with public application url is necessary in the future.
    // (see scripts/setup-tests.mjs)
    await openService(page, "SAR-COIN - Coherence and Intensity Composite");

    const parametersTable = page.getByTestId("parameters-table");
    await expect(parametersTable).toBeVisible();

    const rows = parametersTable.locator("tr");
    await expect(rows).toHaveCount(3);

    // Check if the first row contains header information
    const headerCells = rows.first().locator("th");
    await expect(headerCells.nth(0)).toHaveText("Parameter");
    await expect(headerCells.nth(1)).toHaveText("Type");
    await expect(headerCells.nth(2)).toHaveText("Default");

    // Check if the content rows contain parameter information
    const contentCells = rows.nth(1).locator("td");
    await expect(contentCells.nth(0)).toContainText(
      "STAC item reference (required)",
    );
    await expect(contentCells.nth(1)).toHaveText("string");
    await expect(contentCells.nth(2)).toHaveText("");
  });

  test("Should not show parameters in the details page for protected OGC API Process service", async ({
    page,
  }) => {
    await openService(page, "Burned Area Severity (BAS) analysis");
    const parametersTable = page.getByTestId("parameters-table");
    await expect(parametersTable).not.toBeVisible();
  });

  test("Should show the service access label as public for OpenEO service", async ({
    page,
  }) => {
    await openService(page, "Multi output gaussian process regression");

    const accessLabel = page.getByTestId("service-access-label");
    await expect(accessLabel).toBeVisible();
    await expect(accessLabel).toHaveText("public");

    const executionLabel = page.getByTestId("execution-info-label");
    await expect(executionLabel.first()).toHaveText("Process ID");
    await expect(executionLabel.nth(1)).toHaveText("openEO Process");
    await expect(executionLabel.last()).toHaveText("openEO Backend");
  });

  test("Should show the service access label as protected for OGC API Process service", async ({
    page,
  }) => {
    await openService(page, "Burned Area Severity (BAS) analysis");

    const accessLabel = page.getByTestId("service-access-label");
    await expect(accessLabel).toBeVisible();
    await expect(accessLabel).toHaveText("protected");

    const executionLabel = page.getByTestId("execution-info-label");
    await expect(executionLabel.first()).toHaveText("OGC API Process");
    await expect(executionLabel.last()).toContainText(
      "CWL Definition protected",
    );
  });

  test("Should display powered by logo in detail page", async ({ page }) => {
    await openService(page, "Multi output gaussian process regression");

    const poweredByLogo = page.getByTestId("powered-by");
    await expect(poweredByLogo).toBeVisible();

    await expect(poweredByLogo.getByText("Powered by")).toBeVisible();

    const logoImage = poweredByLogo.locator("img");
    await expect(logoImage).toBeVisible();
    await expect(logoImage).toHaveAttribute("alt");
    await expect(logoImage).toHaveAttribute("src");
  });

  test("Should display provided by logo in detail page", async ({ page }) => {
    await openService(page, "Multi output gaussian process regression");

    const providedByLogo = page.getByTestId("provided-by");
    await expect(providedByLogo).toBeVisible();

    await expect(providedByLogo.getByText("Provided by")).toBeVisible();

    const logoImage = providedByLogo.locator("img");
    await expect(logoImage).toBeVisible();
    await expect(logoImage).toHaveAttribute("alt");
    await expect(logoImage).toHaveAttribute("src");
  });

  test("Should have clickable logo links in detail page", async ({ page }) => {
    await openService(page, "Multi output gaussian process regression");

    const poweredByLink = page.getByTestId("powered-by").locator("a");
    await expect(poweredByLink).toHaveAttribute("href");
    await expect(poweredByLink).toHaveAttribute("target", "__blank");

    const providedByLink = page.getByTestId("provided-by").locator("a");
    await expect(providedByLink).toHaveAttribute("href");
    await expect(providedByLink).toHaveAttribute("target", "__blank");
  });
});

test.describe("Notebook Execution Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4321/apps/parcel_delineation");
  });

  test("Should render execute notebook action", async ({ page }) => {
    const notebookSelect = page.locator("#notebook-select");
    await expect(notebookSelect).toBeVisible();

    const options = notebookSelect.locator("option");
    const defaultOption = options.first();
    await expect(defaultOption).toHaveText("Execute notebook");

    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Should open notebook in new tab with correct URL when option is selected", async ({
    page,
    context,
  }) => {
    const notebookSelect = page.locator("#notebook-select");

    const options = notebookSelect.locator("option");

    const notebookOption = options.nth(1);
    const notebookUrl = await notebookOption.getAttribute("value");

    expect(notebookUrl).toBeTruthy();

    const pagePromise = context.waitForEvent("page");

    await notebookSelect.selectOption({ index: 1 });

    const newPage = await pagePromise;
    const newPageUrl = newPage.url();

    expect(newPageUrl).toContain("?fromURL=");
    expect(newPageUrl).toContain(encodeURIComponent(notebookUrl!));

    await newPage.close();
  });
});

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
    ).toHaveAttribute("href", "https://github.com/Open-EO/FuseTS");
    await expect(
      page.getByRole("link").getByText("Execute service"),
    ).toHaveAttribute(
      "href",
      "https://editor.openeo.org/?wizard=UDP&wizard~process=fusets_mogpr&wizard~processUrl=https://raw.githubusercontent.com/ESA-APEx/apex_algorithms/refs/heads/main/algorithm_catalog/vito/fusets_mogpr/openeo_udp/fusets_mogpr.json&server=https://openeofed.dataspace.copernicus.eu",
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
    await openService(page, "Sentinel-1 statistics");

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
    await openService(page, "Multi output gaussian process regression");

    const parametersTable = page.getByTestId("parameters-table");
    await expect(parametersTable).toBeVisible();

    const rows = parametersTable.locator("tr");
    await expect(rows).toHaveCount(5);

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
    await expect(contentCells.nth(1)).toHaveText(
      "object/bounding-box, object/datacube",
    );
    await expect(contentCells.nth(2)).toHaveText("");
  });

  test("Should show parameters in the details page for public OGC API Process service", async ({
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

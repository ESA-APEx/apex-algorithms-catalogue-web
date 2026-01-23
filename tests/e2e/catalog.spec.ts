import { test, expect } from "@playwright/test";

test.describe("Catalog Tests", () => {
  const getAlgorithmCount = async (page: any) => {
    const resultsText = await page.getByText("Showing").textContent();
    const totalMatch = resultsText?.match(/of (\d+) algorithms/);
    return totalMatch ? parseInt(totalMatch[1]) : 0;
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Should render the homepage correctly", async ({ page }) => {
    await expect(page).toHaveTitle("APEx Algorithm Catalogue");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Algorithm Catalogue",
    );

    await page.getByRole("textbox", { name: /Search algorithms/i }).fill("ESA");

    const card = page
      .getByTestId("service-card")
      .getByText("ESA worldcereal global crop type detector")
      .locator("..");
    await expect(card).toBeVisible();

    await expect(card.getByTestId("service-type")).toHaveText("openEO");
    await expect(card.getByTestId("service-label").nth(0)).toContainText(
      "Agriculture",
    );
    await expect(card.getByTestId("service-label").nth(1)).toContainText(
      "Sentinel-2",
    );
  });

  test("Should not show a private algorithm", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("private");

    await expect(
      page
        .getByTestId("service-card")
        .getByText("Private Algorithm Test")
        .locator(".."),
    ).toHaveCount(0);
  });

  test("Should display powered by logo in service cards", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    const serviceCard = page
      .getByTestId("service-card")
      .getByText("ESA worldcereal global crop type detector")
      .locator("..");

    const poweredByLogo = serviceCard.getByTestId("powered-by");
    await expect(poweredByLogo).toBeVisible();

    await expect(poweredByLogo.getByText("Powered by")).toBeVisible();

    const logoImage = poweredByLogo.locator("img");
    await expect(logoImage).toBeVisible();
    await expect(logoImage).toHaveAttribute("alt");
  });

  test("Should display provided by logo in service cards", async ({ page }) => {
    await expect(page.getByTestId("service-card").first()).toBeVisible();

    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("worldcereal");

    const serviceCard = page
      .getByTestId("service-card")
      .getByText("ESA worldcereal global crop type detector")
      .locator("..");

    const providedByLogo = serviceCard.getByTestId("provided-by");
    await expect(providedByLogo).toBeVisible();

    await expect(providedByLogo.getByText("Provided by")).toBeVisible();

    const logoImage = providedByLogo.locator("img");
    await expect(logoImage).toBeVisible();
    await expect(logoImage).toHaveAttribute("alt");
  });

  test("Should display pagination controls", async ({ page }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    const itemCount = await page.getByTestId("apps-item").count();

    if (itemCount > 12) {
      await expect(page.getByTestId("pagination")).toBeVisible();
      await expect(page.getByTestId("pagination-previous")).toBeVisible();
      await expect(page.getByTestId("pagination-next")).toBeVisible();
      await expect(page.getByTestId("pagination-page-1")).toBeVisible();
    }
  });

  test("Should not display pagination controls when there are only few services", async ({
    page,
  }) => {
    await page.getByRole("button").getByText("Filter").click();
    await page.getByTestId("filter-type-item").first().click();

    await page.waitForTimeout(500);

    await expect(page.getByTestId("pagination")).not.toBeVisible();
  });

  test("Should navigate to next page and show correct items", async ({
    page,
  }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    await expect(page.getByTestId("pagination")).toBeVisible();

    const firstPageItems = await page
      .getByTestId("apps-item")
      .allTextContents();

    await page.getByTestId("pagination-next").click();

    await expect(page.getByTestId("pagination-page-2")).toHaveAttribute(
      "aria-current",
      "page",
    );

    const secondPageItems = await page
      .getByTestId("apps-item")
      .allTextContents();
    expect(firstPageItems).not.toEqual(secondPageItems);

    await expect(page.getByTestId("pagination-previous")).not.toBeDisabled();
  });

  test("Should navigate to previous page correctly", async ({ page }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    await expect(page.getByTestId("pagination")).toBeVisible();

    await page.getByTestId("pagination-next").click();

    const secondPageItems = await page
      .getByTestId("apps-item")
      .allTextContents();

    await page.getByTestId("pagination-previous").click();

    await expect(page.getByTestId("pagination-page-1")).toHaveAttribute(
      "aria-current",
      "page",
    );

    const firstPageItems = await page
      .getByTestId("apps-item")
      .allTextContents();
    expect(firstPageItems).not.toEqual(secondPageItems);

    await expect(page.getByTestId("pagination-previous")).toBeDisabled();
  });

  test("Should navigate to specific page number", async ({ page }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    await expect(page.getByTestId("pagination")).toBeVisible();

    const page2Button = page.getByTestId("pagination-page-2");
    if (await page2Button.isVisible()) {
      await page2Button.click();

      await expect(page.getByTestId("pagination-page-2")).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("Should show correct results count with pagination info", async ({
    page,
  }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    const resultsText = await page.getByText("Showing").textContent();
    expect(resultsText).toMatch(/Showing \d+-\d+ of \d+ algorithms/);
    expect(resultsText).toMatch(/Page \d+ of \d+/);

    await page.getByTestId("pagination-next").click();

    const updatedResultsText = await page.getByText("Showing").textContent();
    expect(updatedResultsText).toMatch(/Showing \d+-\d+ of \d+ algorithms/);
    expect(updatedResultsText).toMatch(/Page \d+ of \d+/);

    expect(resultsText).not.toEqual(updatedResultsText);
  });

  test("Should reset to page 1 when searching", async ({ page }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    await page.getByTestId("pagination-next").click();

    await expect(page.getByTestId("pagination-page-2")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page
      .getByRole("textbox", { name: /Search algorithms/i })
      .fill("test");

    const paginationVisible = await page.getByTestId("pagination").isVisible();
    if (paginationVisible) {
      await expect(page.getByTestId("pagination-page-1")).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("Should disable next button on last page", async ({ page }) => {
    await expect(page.getByTestId("apps").first()).toBeVisible();

    await expect(page.getByTestId("pagination")).toBeVisible();

    let nextButton = page.getByTestId("pagination-next");
    while (!(await nextButton.isDisabled())) {
      await nextButton.click();
    }

    await expect(nextButton).toBeDisabled();
  });
});

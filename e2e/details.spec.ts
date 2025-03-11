import {expect, type Page, test} from '@playwright/test';

const openService = async (page: Page, name: string) => {
    await page.getByTestId('service-card').getByText(name).first().click();
}

test.describe('Service Details Test', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/');
    });

    test("Should open the details page", async ({page}) => {

        await openService(page, 'ESA worldcereal global crop type detector');
        await page.waitForURL('**/apps/worldcereal_crop_type');
    });

    test("Should show the correct links for an openEO service", async ({page}) => {
        await openService(page, 'Multi output gaussian process regression');

        await expect(page.getByRole('link').getByText('Open documentation')).toHaveAttribute('href', 'https://open-eo.github.io/FuseTS/');
        await expect(page.getByRole('link').getByText('Show code repository')).toHaveAttribute('href', 'https://github.com/Open-EO/FuseTS');
        await expect(page.getByRole('link').getByText('Execute service')).toHaveAttribute('href', 'https://editor.openeo.org/?wizard=UDP&wizard~process=fusets_mogpr&wizard~processUrl=https://raw.githubusercontent.com/ESA-APEx/apex_algorithms/refs/heads/main/algorithm_catalog/vito/fusets_mogpr/openeo_udp/fusets_mogpr.json&server=https://openeofed.dataspace.copernicus.eu');
    });

    test("Should show the correct links for an OGC API Process service", async ({page}) => {
        await openService(page, 'Burned Area Severity (BAS) analysis');

        await expect(page.getByRole('link').getByText('Open documentation')).toHaveAttribute('href', 'https://geohazards-tep.gitlab.io/gep-docs/services/burned-area-severity/service-specs/');
        await expect(page.getByRole('link').getByText('Request access')).toHaveAttribute('href', 'https://geohazards-tep.eu/#!web_store');
        await expect(page.getByRole('link').getByText('Execute service')).toHaveAttribute('href', 'https://geohazards-tep.eu/geobrowser/?id=opt-bas-app');
    });

    test("Should show warning for restricted OGC API Process services", async ({page}) => {
        await openService(page, 'Burned Area Severity (BAS) analysis');

        await expect(page.getByTestId('service-access-warning')).toBeVisible();
    });

    test("Should not show warning for openEO services", async ({page}) => {
        await openService(page, 'Multi output gaussian process regression');

        await expect(page.getByTestId('service-access-warning')).not.toBeVisible();
    });

})
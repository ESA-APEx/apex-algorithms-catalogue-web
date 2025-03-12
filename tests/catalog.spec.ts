import { test, expect } from '@playwright/test';

test.describe('Catalog Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Should render the homepage correctly', async ({ page }) => {
        await expect(page).toHaveTitle('Algorithm Services Catalogue | APEx');
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Algorithm Services Catalogue');

        const card = page.getByTestId('service-card').getByText('ESA worldcereal global crop type detector').locator('..');
        await expect(card).toBeVisible()

        await expect(card.getByTestId('service-type')).toHaveText('openEO');
        await expect(card.getByTestId('service-label').nth(0)).toContainText('agriculture');
        await expect(card.getByTestId('service-label').nth(1)).toContainText('crops');
    });

    test('Should apply the type filtering', async ({ page }) => {
        const openEO = (await page.getByTestId('service-type').getByText('openEO').all()).length;
        const ogcAPI = (await page.getByTestId('service-type').getByText('OGC API Process').all()).length;

        await expect(page.getByTestId('service-card')).toHaveCount(openEO + ogcAPI);

        await page.getByRole('button').getByText('Filter').click();

        await page.getByTestId('filter-type-item').getByText('openEO').click();
        await expect(page.getByTestId('service-card')).toHaveCount(openEO);

        await page.getByTestId('filter-type-item').getByText('openEO').click();
        await expect(page.getByTestId('service-card')).toHaveCount(openEO + ogcAPI);

        await page.getByTestId('filter-type-item').getByText('OGC API Process').click();
        await expect(page.getByTestId('service-card')).toHaveCount(ogcAPI);

        await page.getByTestId('filter-type-item').getByText('OGC API Process').click();
        await expect(page.getByTestId('service-card')).toHaveCount(openEO + ogcAPI);
    });
})
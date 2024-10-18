import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {

    test('HomePage is rendered correctly', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle('Algorithms Catalogue - APEx');
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Algorithms Catalogue');

        const card = page.getByText('ESA worldcereal global maize detector')
        await expect(card.first()).toBeVisible()
    });

    test("User can navigate to apps detail page from HomePage", async ({ page }) => {
        await page.goto('/');

        const card = page.getByText('ESA worldcereal global maize detector').first()
        await card.click()
        await page.waitForURL('**/apps/worldcereal_inference');
    })
})
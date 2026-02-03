import base from '@playwright/test';
import defaultBenchmark from '../fixtures/benchmarks.json';

export const test = base.extend<{
    benchmarkMock: any;
}>({
    benchmarkMock: [
        ...defaultBenchmark,
    ],

    page: async ({ page, benchmarkMock }, use) => {
        await page.route('**/api/benchmarks.json', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(benchmarkMock),
            })
        );

        await use(page);
    },
});

export { expect } from '@playwright/test';

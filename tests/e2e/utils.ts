import base from '@playwright/test';
import { read, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';



const getFixturesDir = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return join(__dirname, '../fixtures');
}
const readFixture = (filename: string) => {
    return JSON.parse(
        readFileSync(join(getFixturesDir(), filename), 'utf-8')
    );

}


const defaultBenchmark = readFixture('benchmarks.json');


export const test = base.extend<{
    benchmarkMock: any;
}>({
    benchmarkMock: [
        ...defaultBenchmark,
    ],

    page: async ({ page, benchmarkMock }, use) => {
        await page.route('**/api/services/benchmarks.json', route =>
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

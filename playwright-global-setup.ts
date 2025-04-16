import type { FullConfig } from '@playwright/test';

const globalSetup = async (_config: FullConfig): Promise<void> => {
    console.log('Manually initialize cache by triggering API call, making the test faster...');
    try {
        await fetch('http://localhost:4321/api/services/benchmarks.json');
        console.log('Initializing cache done ✅.');
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default globalSetup;
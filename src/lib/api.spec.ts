import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getUrls } from './api';

const baseUrl = 'https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet';

global.fetch = vi.fn();

describe('getUrls', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        global.cachedUrls = [];
    });

    it('should return cached URLs if they exist', async () => {
        const mockUrls = [`${baseUrl}/2024-08/part-0.parquet`];
        
        global.cachedUrls = mockUrls;

        const result = await getUrls();

        expect(result).toEqual(mockUrls);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch URLs and return them when they exist', async () => {
        const existingUrl = `${baseUrl}/2024-08/part-0.parquet`;
        
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

        const currentDate = new Date('2024-09-01');
        vi.setSystemTime(currentDate);

        const result = await getUrls();

        expect(result).toContain(existingUrl);
        expect(result.length).toBe(1);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no URLs exist', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

        const currentDate = new Date('2024-08-01');
        vi.setSystemTime(currentDate);

        const result = await getUrls();

        expect(result).toEqual([]);
        expect(fetch).toHaveBeenCalledTimes(0);
    });
});
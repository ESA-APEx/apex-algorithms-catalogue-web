import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './benchmarks.json';
import { executeQuery } from '@/lib/db';
import { getUrls, PARQUET_MONTH_COVERAGE } from '@/lib/parquet-datasource';
import type { BenchmarkSummary } from '@/types/models/benchmark';

vi.mock('@/lib/db', () => ({
    executeQuery: vi.fn(),
}));

vi.mock('@/lib/parquet-datasource', () => ({
    getUrls: vi.fn(),
    isCacheExpired: vi.fn().mockReturnValue(true),
    PARQUET_MONTH_COVERAGE: '2',
}));

describe('API Route: GET', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return benchmark data', async () => {
        (getUrls as jest.Mock).mockResolvedValue(['https://example.com/data.parquet']);

        const mockData: BenchmarkSummary[] = [
            { scenario_id: 'A', runs: 5, success_count: 5, failed_count: 0 },
            { scenario_id: 'B', runs: 10, success_count: 8, failed_count: 2 }
        ];

        (executeQuery as jest.Mock).mockResolvedValue(mockData);

        const response = await GET({} as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);

        const jsonData = await response.json();
        expect(jsonData.length).toEqual(2);
    });

    it('should return an error response when an exception occurs', async () => {
        (getUrls as jest.Mock).mockRejectedValue(new Error('API failure'));

        const response = await GET({} as any);
        expect(response).toBeInstanceOf(Response);
        expect(response?.status).toBe(500);

        const jsonResponse = await response.json();
        expect(jsonResponse).toEqual({ message: 'Fetching benchmark statistics from all services failed.' });
    });
});

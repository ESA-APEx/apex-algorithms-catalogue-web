import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './benchmarks.json';
import { getUrls } from '@/lib/parquet-datasource';
import { executeQuery } from '@/lib/db';

vi.mock('@/lib/parquet-datasource', () => ({
    getUrls: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    executeQuery: vi.fn(),
}));

describe('API Route: GET /benchmarks/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return benchmark data for a given scenario', async () => {
        const mockUrls = ['https://example.com/data.parquet'];
        const mockScenarioId = 'scenario-123';
        const mockData = [
            {
                cpu: 100,
                memory: 200,
                costs: 300,
                duration: 400.5,
                input_pixel: 500,
                max_executor_memory: 600,
                network_received: 700,
                start_time: '2024-02-27T12:00:00Z',
                status: 'success'
            },
        ];

        (getUrls as jest.Mock).mockResolvedValue(mockUrls);
        (executeQuery as jest.Mock).mockResolvedValue(mockData);

        const response = await GET({ params: { id: mockScenarioId } } as any);
        const jsonResponse = await response.json();

        expect(response.status).toBe(200);
        expect(jsonResponse).toEqual({
            scenario_id: mockScenarioId,
            data: mockData,
        });

        expect(getUrls).toHaveBeenCalledOnce();
        expect(executeQuery).toHaveBeenCalledOnce();
    });

    it('should return a 500 error response when an exception occurs', async () => {
        (getUrls as jest.Mock).mockRejectedValue(new Error('API failure'));

        const response = await GET({ params: { id: 'scenario-123' } } as any);

        expect(response.status).toBe(500);

        const jsonResponse = await response.json();
        expect(jsonResponse).toEqual({ error: 'Internal server error' });

        expect(getUrls).toHaveBeenCalledOnce();
        expect(executeQuery).not.toHaveBeenCalled();
    });
});
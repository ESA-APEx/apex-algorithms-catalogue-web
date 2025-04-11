import type { BenchmarkSummary } from '@/types/models/benchmark';

export const getBenchmarkSummary = async () => {
    try {
        const response = await fetch('/api/services/benchmarks.json');
        if (response.ok) {
            return await response.json() as BenchmarkSummary[];                
        }
    } catch (error) {
        throw error;
    }
};
import type { BenchmarkSummary, BenchmarkStatusKey } from "@/types/models/benchmark";

export const STATUS_THRESHOLD = {
    stable: 0.75,
    unstable: 0,
    'no benchmark': null,
}

export const getBenchmarkStatus = (data?: BenchmarkSummary): BenchmarkStatusKey => {
    if (data) {
        const successRate = data.success_count / data.runs;
        if (successRate >= STATUS_THRESHOLD.stable) {
            return 'stable';
        } 
        return 'unstable';
    }
    return 'no benchmark';
}
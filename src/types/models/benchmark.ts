export interface BenchmarkDetails {
    scenario: string;
    data: BenchmarkData[]
}

export interface BenchmarkData {
    cpu: number;
    costs: number;
    memory: number;
    duration: number;
    start_time: string;
}

export interface BenchmarkSummary {
    runs: number;
    cpu_avg: number;
    cpu_stddev_samp: number;
    cpu_stddev_pop: number;
    duration_avg: number;
    cost_avg: number;
    scenario_id: string;
    network_received_avg: number;
    success_count: number;
    failed_count: number;
    input_pixels: number;
}
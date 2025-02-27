export interface BenchmarkDetails {
    scenario_id: string;
    data: BenchmarkData[]
}

export interface BenchmarkData {
    cpu: number;
    costs: number;
    memory: number;
    duration: number;
    start_time: string;
    input_pixel: number;
    max_executor_memory: number;
    network_received: number;
}

export interface BenchmarkSummary {
    runs: number;
    scenario_id: string;
    success_count: number;
    failed_count: number;
}
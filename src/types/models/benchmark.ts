export interface BenchmarkDetails {
  service_id: string;
  data: BenchmarkData[];
}

export interface BenchmarkData {
  scenario_id: string;
  cpu: number;
  costs: number;
  memory: number;
  duration: number;
  start_time: string;
  input_pixel: number;
  max_executor_memory: number;
  network_received: number;
  area_size: number;
  status: "passed" | "failed";
}

export interface BenchmarkSummary {
  runs: number;
  scenario_id: string;
  success_count: number;
  failed_count: number;
  last_test_datetime?: string;
}

export type BenchmarkStatusKey = "stable" | "unstable" | "no benchmark";

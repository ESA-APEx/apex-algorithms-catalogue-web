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
}

export interface AdminBenchmarkData extends BenchmarkData {
  test_outcome: string;
  test_phase_end: string;
  status: BenchmarkStatusKey;
}

export interface AdminBenchmarkSummary {
  scenario_id: string;
  runs: number;
  success_count: number;
  failed_count: number;
  last_test_datetime: string;
  last_test_phase: string;
  status: BenchmarkStatusKey;
}

export interface BenchmarkSummary {
  scenario_id: string;
  status: BenchmarkStatusKey;
  last_test_datetime: string;
}

export type BenchmarkStatusKey = "healthy" | "warning" | "critical" | "no benchmark";

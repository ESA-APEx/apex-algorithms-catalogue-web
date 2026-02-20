export interface BenchmarkScenario {
  id: string;
  type: string;
  description: string;
  backend: string;
  process_graph: Record<string, any>;
  reference_data?: Record<string, string>;
}

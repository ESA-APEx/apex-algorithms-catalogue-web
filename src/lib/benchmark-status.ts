import type {
  AdminBenchmarkSummary,
  BenchmarkStatusKey,
} from "@/types/models/benchmark";

export const statusDescriptions: Record<BenchmarkStatusKey, string> = {
  "no benchmark": "No test benchmark found",
  critical: "The service execution failed in the create-job or run-job phase",
  warning: "The service execution failed in one of the other phases",
  healthy: "Everything executed successfully",
};

export const statusOrder: BenchmarkStatusKey[] = [
  "no benchmark",
  "critical",
  "warning",
  "healthy",
];

export const getBenchmarkStatus = (
  data?: AdminBenchmarkSummary,
): BenchmarkStatusKey => {
  if (data) {
    const successRate = data.success_count / data.runs;
    if (successRate >= 0.75) {
      return "healthy";
    }
    return "warning";
  }
  return "no benchmark";
};

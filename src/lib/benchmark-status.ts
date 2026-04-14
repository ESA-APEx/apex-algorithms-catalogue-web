import type {
  AdminBenchmarkSummary,
  BenchmarkStatusKey,
} from "@/types/models/benchmark";

export const STATUS_THRESHOLD = {
  stable: 0.75,
  unstable: 0,
  "no benchmark": null,
};

export const statusDescriptions: Record<BenchmarkStatusKey, string> = {
  "no benchmark": "No test benchmark found",
  critical: "The service execution failed in the create-job or run-job phase",
  unstable: "The service execution failed in one of the other phases",
  stable: "Everything executed successfully",
};

export const statusOrder: BenchmarkStatusKey[] = [
  "no benchmark",
  "critical",
  "unstable",
  "stable",
];

export const getBenchmarkStatus = (
  data?: AdminBenchmarkSummary,
): BenchmarkStatusKey => {
  if (data) {
    const successRate = data.success_count / data.runs;

    if (successRate >= STATUS_THRESHOLD.stable) {
      return "stable";
    }
    return "unstable";
  }
  return "no benchmark";
};

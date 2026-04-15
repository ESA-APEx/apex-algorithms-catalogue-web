import type {
  AdminBenchmarkSummary,
  BenchmarkStatusKey,
  BenchmarkSummary,
} from "@/types/models/benchmark";
import benchmarkMapping from "@/benchmark-mapping.json";

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

export const calculateStatusFromSummary = (
  scenarioId: string,
  data?: BenchmarkSummary[],
): BenchmarkStatusKey => {
  //@ts-ignore
  const mappedScenarioId = benchmarkMapping[scenarioId] || [scenarioId];
  if (data) {
    const summaryData = data.filter((item) =>
      mappedScenarioId.includes(item.scenario_id),
    );
    return (
      summaryData.reduce(
        (acc, item) => {
          if (item.status === "critical") return "critical";
          if (item.status === "warning" && acc !== "critical") return "warning";
          if (item.status === "healthy" && acc === undefined) return "healthy";
          return acc;
        },
        undefined as BenchmarkStatusKey | undefined,
      ) || "no benchmark"
    );
  }
  return "no benchmark";
};

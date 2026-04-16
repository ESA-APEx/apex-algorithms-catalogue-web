import benchmarkMapping from "@/benchmark-mapping.json";
import type {
  BenchmarkStatusKey,
  BenchmarkSummary
} from "@/types/models/benchmark";


export const statusOrder: BenchmarkStatusKey[] = [
  "no benchmark",
  "critical",
  "warning",
  "healthy",
];

export interface BenchmarkStatusInfo {
  status: BenchmarkStatusKey;
  description: string;
}

export const calculateStatusFromSummary = (
  scenarioId: string,
  data?: BenchmarkSummary[],
): BenchmarkStatusInfo => {
  //@ts-ignore
  const mappedScenarioId = benchmarkMapping[scenarioId] || [scenarioId];
  if (data) {
    const summaryData = data.filter((item) =>
      mappedScenarioId.includes(item.scenario_id),
    );
    const status = summaryData.reduce(
        (acc, item) => {
          if (item.status === "critical") return "critical";
          if (item.status === "warning" && acc !== "critical") return "warning";
          if (item.status === "healthy" && acc === undefined) return "healthy";
          return acc;
        },
        undefined as BenchmarkStatusKey | undefined,
      ) || "no benchmark";
    

    return { 
      status: status,
      description: getStatusDescription(status)
    } 
  }
  return { status: "no benchmark", description: getStatusDescription("no benchmark") };
};

export const getStatusDescription = (status: BenchmarkStatusKey): string => {
  if (status === "no benchmark") {
    return "There is no benchmark data available for this service.";
  } else if (status === "healthy") {
    return "The latest benchmark results indicate that the service is healthy.";
  } else if (status === "warning") {
    return "The latest benchmark results indicate that the service has some issues that may need attention, but could still be functioning.";
  } else if (status === "critical") {
    return "The latest benchmark results indicate that the service might not be working as expected.";
  } else {
    return "The current benchmark status is unknown.";
  }
}

export const getDefaultBenchmarkStatusInfo = (): BenchmarkStatusInfo => ({
  status: "no benchmark",
  description: getStatusDescription("no benchmark"),
});
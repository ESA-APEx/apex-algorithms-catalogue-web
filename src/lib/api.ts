import type { ApplicationDetails } from "@/types/models/application";
import type { BenchmarkSummary } from "@/types/models/benchmark";

export const getBenchmarkSummary = async () => {
  try {
    const response = await fetch("/api/services/benchmarks.json");
    if (response.ok) {
      return (await response.json()) as BenchmarkSummary[];
    }
  } catch (error) {
    throw error;
  }
};

export const getCwlProcessDefinition = async (cwlUrl: string) => {
  try {
    const response = await fetch(
      `/api/services/process-definition.json?url=${cwlUrl}&type=cwl`,
    );
    if (response.ok) {
      return (await response.json()) as ApplicationDetails;
    } else if (response.status === 401) {
      throw { status: "protected", httpStatus: response.status };
    } else {
      throw { status: "error", httpStatus: response.status };
    }
  } catch (error) {
    throw error;
  }
};

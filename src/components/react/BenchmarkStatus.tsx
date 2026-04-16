import { getBenchmarkSummary } from "@/lib/api";
import { calculateStatusFromSummary, getDefaultBenchmarkStatusInfo, type BenchmarkStatusInfo } from "@/lib/benchmark-status";
import { isFeatureEnabled } from "@/lib/featureflag";
import type {
  BenchmarkSummary
} from "@/types/models/benchmark";
import { useEffect, useState } from "react";
import { BenchmarkStatusBadge } from "./BenchmarkStatusBadge";
import { Spinner } from "./Spinner";

interface BenchmarkStatusProps {
  scenarioId: string;
  data?: BenchmarkSummary[];
}

export const BenchmarkStatus = ({ scenarioId, data }: BenchmarkStatusProps) => {
  const isEnabled = isFeatureEnabled(window.location.href, "benchmarkStatus");

  const [status, setStatus] = useState<BenchmarkStatusInfo>();

  const fetchData = async () => {
    try {
      const result = await getBenchmarkSummary();
      if (result) {
        setStatus(calculateStatusFromSummary(scenarioId, result));
      } else {
        setStatus(getDefaultBenchmarkStatusInfo());
        console.error(
          "The response is not ok, setting it to fallback 'no benchmark'.",
        );
      }
    } catch (error) {
      setStatus(getDefaultBenchmarkStatusInfo());
      console.error("Failed to fetch benchmark status", error);
    }
  };

  useEffect(() => {
    if (isEnabled) {
      if (data) {
        setStatus(calculateStatusFromSummary(scenarioId,data));
      } else {
        fetchData();
      }
    }
  }, [data, scenarioId, isEnabled]);
  return (
    isEnabled && (
      <>{status ? <BenchmarkStatusBadge status={status} /> : <Spinner />}</>
    )
  );
};

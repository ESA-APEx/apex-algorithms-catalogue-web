import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/featureflag";
import type { BenchmarkData } from "@/types/models/benchmark";
import { getBenchmarkDetails } from "@/lib/api";
import { getAverageCostPerKm } from "./ExecutionInfoTabs";

interface CostEstimateSideNavItemProps {
  costEstimate: string;
  serviceId: string;
}

export const CostEstimateSideNavItem = ({
  costEstimate,
  serviceId,
}: CostEstimateSideNavItemProps) => {
  const [data, setData] = useState<BenchmarkData[]>();
  const [status, setStatus] = useState<string>("loading");

  const fetchData = async () => {
    setStatus("loading");
    try {
      const result = await getBenchmarkDetails(serviceId);
      if (result) {
        setData(result.data);
        setStatus("success");
      }
    } catch (error) {
      setStatus("error");
      console.error("Failed to fetch cost estimate data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  let displayedCostEstimate = '-';

  if (status === "loading") {
    displayedCostEstimate = "Loading cost estimate data...";
  } else if (status === "error") {
    displayedCostEstimate = "Failed to load cost estimate data.";
  } else if (status === "success" && !data?.length) {
    displayedCostEstimate = "No recent cost estimate data found.";
  } else if (status === "success" && data?.length) {
    displayedCostEstimate = getAverageCostPerKm(data);
  }

  const isEnabled = isFeatureEnabled(window.location.href, "costAnalysis");

  return (
    <li data-testid="cost-estimate-sidenav">
        <div className="text-white mb-1">Cost estimation</div>
        <div>
            {isEnabled ? displayedCostEstimate : costEstimate}
        </div>
    </li>
  );
};
import { getAdminBenchmarksScenarioData } from "@/lib/api";
import type { BenchmarkData } from "@/types/models/benchmark";
import { addMonths } from "date-fns";
import React, { useState, useEffect } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { getBenchmarkStatus } from "@/lib/benchmark-status";
import { BenchmarkStatusBadge } from "./BenchmarkStatusBadge";
import { BenchmarkLineChart } from "./BenchmarkLineChart";
import { BenchmarkMetricsTable } from "./BenchmarkMetricsTable";

interface AdminBenchmarksChartProps {
  className?: string;
  id: string;
}

const chartConfig = {
  cpu: {
    label: "CPU usage (seconds)",
    borderColor: "rgb(34, 197, 94)", // green-500
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    pointBackgroundColor: "rgb(34, 197, 94)",
  },
  memory: {
    label: "Memory Usage (seconds)",
    borderColor: "rgb(59, 130, 246)", // blue-500
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    pointBackgroundColor: "rgb(59, 130, 246)",
  },
  costs: {
    label: "Costs (credits)",
    borderColor: "rgb(234, 88, 12)", // orange-500
    backgroundColor: "rgba(234, 88, 12, 0.1)",
    pointBackgroundColor: "rgb(234, 88, 12)",
  },
  duration: {
    label: "Duration (seconds)",
    borderColor: "rgb(168, 85, 247)", // purple-500
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    pointBackgroundColor: "rgb(168, 85, 247)",
  },
};

export const AdminBenchmarksChart: React.FC<AdminBenchmarksChartProps> = ({
  className,
  id,
}) => {
  const [data, setData] = useState<BenchmarkData[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const defaultEndDate = new Date().toISOString().split("T")[0];
    const defaultStartDate = addMonths(new Date(), -2)
      .toISOString()
      .split("T")[0];

    const urlParams = new URLSearchParams(window.location.search);
    const urlStartDate = urlParams.get("start") || defaultStartDate;
    const urlEndDate = urlParams.get("end") || defaultEndDate;

    setStartDate(urlStartDate);
    setEndDate(urlEndDate);
    fetchData(id, urlStartDate, urlEndDate);
  }, []);

  const updateURL = (newStartDate?: string, newEndDate?: string) => {
    const url = new URL(window.location.href);

    if (newStartDate) {
      url.searchParams.set("start", newStartDate);
    } else {
      url.searchParams.delete("start");
    }

    if (newEndDate) {
      url.searchParams.set("end", newEndDate);
    } else {
      url.searchParams.delete("end");
    }

    window.history.replaceState({}, "", url.toString());
  };

  const fetchData = async (id: string, start?: string, end?: string) => {
    updateURL(start, end);
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminBenchmarksScenarioData(id, start, end);
      setData(result || []);
    } catch (err) {
      console.error("Failed to fetch admin benchmark data:", err);
      setError("Failed to load benchmark data. Please try again later.");
    }

    setLoading(false);
  };

  const handleDateFilter = () => {
    fetchData(id, startDate || undefined, endDate || undefined);
  };

  const runs = data?.length;
  const success = data?.filter((d) => d.status === "passed").length;
  const failed = data?.filter((d) => d.status === "failed").length;
  const successRate =
    success !== undefined && runs !== undefined ? (success / runs) * 100 : 0;
  const status = getBenchmarkStatus({
    runs: runs || 0,
    scenario_id: id,
    success_count: success || 0,
    failed_count: failed || 0,
  });

  return (
    <div className={className}>
      <div className="flex items-end text-white px-4 mb-16">
        <div className="flex-1 flex items-center space-x-2">
          <h2 className="text-4xl">{id}</h2>
        </div>
        <div className="flex-none flex items-center">
          <div className="flex-none flex flex-wrap gap-4 items-end">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium mb-1"
              >
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || new Date().toISOString().split("T")[0]}
                className="text-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium mb-1"
              >
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
                className="text-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDateFilter}
                disabled={loading}
                variant="default"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-8 text-white">
          <Spinner />
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500 text-center">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      {!loading && data && data.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">No benchmark data available</p>
        </div>
      ) : null}
      {!loading && data && data.length > 0 && (
        <>
          <div className="flex gap-4 px-4 mb-6 text-white">
            <div className="flex-1 flex flex-col">
              <p>Total Runs</p>
              <p className="text-6xl py-4" data-testid="stat-value">
                {runs}
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <p>Successful Runs</p>
              <p className="text-6xl py-4" data-testid="stat-value">
                {success}
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <p>Failed Runs</p>
              <p className="text-6xl py-4" data-testid="stat-value">
                {failed}
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <p>Status</p>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-1 text-xl">
                  <BenchmarkStatusBadge status={status} />
                  <span className="font-medium text-gray-300">
                    ({successRate.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 mb-8">
            <BenchmarkMetricsTable data={data} />
          </div>

          <section className="px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <BenchmarkLineChart
              data={data}
              loading={loading}
              error={error}
              metric="cpu"
              config={chartConfig.cpu}
            />
            <BenchmarkLineChart
              data={data}
              loading={loading}
              error={error}
              metric="memory"
              config={chartConfig.memory}
            />
            <BenchmarkLineChart
              data={data}
              loading={loading}
              error={error}
              metric="duration"
              config={chartConfig.duration}
            />
            <BenchmarkLineChart
              data={data}
              loading={loading}
              error={error}
              metric="costs"
              config={chartConfig.costs}
            />
          </section>
        </>
      )}
    </div>
  );
};

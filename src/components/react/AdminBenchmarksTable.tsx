import React, { useState, useEffect } from "react";
import { getAdminBenchmarks } from "@/lib/api";
import type { BenchmarkSummary } from "@/types/models/benchmark";
import { getBenchmarkStatus } from "@/lib/benchmark-status";
import { BenchmarkStatusBadge } from "./BenchmarkStatusBadge";
import { Spinner } from "./Spinner";
import { Input } from "./Input";
import { Button } from "./Button";
import { addMonths } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

interface AdminBenchmarksTableProps {
  className?: string;
}

export const AdminBenchmarksTable: React.FC<AdminBenchmarksTableProps> = ({
  className,
}) => {
  const [data, setData] = useState<BenchmarkSummary[]>([]);
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
    fetchData(urlStartDate, urlEndDate);
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

  const fetchData = async (start?: string, end?: string) => {
    updateURL(start, end);
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminBenchmarks(start, end);
      setData(result || []);
    } catch (err) {
      console.error("Failed to fetch admin benchmark data:", err);
      setError("Failed to load benchmark data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchData(startDate || undefined, endDate || undefined);
  };

  const calculateSuccessRate = (
    successCount: number,
    totalRuns: number,
  ): number => {
    if (totalRuns === 0) return 0;
    return Number(((successCount / totalRuns) * 100).toFixed(1));
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={className}>
      <div className="mb-6 p-4 text-white flex">
        <div className="flex-1 flex items-center">
          <h2 className="text-2xl">Benchmark Results</h2>
        </div>
        <div>
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

      {/* Table Section */}
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
        <Table className="text-white">
          <TableHeader>
            <TableRow>
              <TableHead>Scenario ID</TableHead>
              <TableHead>Total Runs</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((benchmark) => {
              const successRate = calculateSuccessRate(
                benchmark.success_count,
                benchmark.runs,
              );
              const status = getBenchmarkStatus(benchmark);

              return (
                <TableRow key={benchmark.scenario_id}>
                  <TableCell className="font-medium">
                    {benchmark.scenario_id}
                  </TableCell>
                  <TableCell>{formatNumber(benchmark.runs)}</TableCell>
                  <TableCell>{formatNumber(benchmark.success_count)}</TableCell>
                  <TableCell>{formatNumber(benchmark.failed_count)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <BenchmarkStatusBadge status={status} />
                      <span className="font-medium text-gray-300">
                        ({successRate}%)
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

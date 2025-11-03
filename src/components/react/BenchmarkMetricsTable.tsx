import React from "react";
import type { BenchmarkData } from "@/types/models/benchmark";

interface BenchmarkMetricsTableProps {
  data: BenchmarkData[];
  className?: string;
}

interface MetricStats {
  min: number;
  max: number;
  average: number;
  count: number;
}

interface AggregatedMetrics {
  cpu: MetricStats;
  memory: MetricStats;
  duration: MetricStats;
  costs: MetricStats;
}

export const BenchmarkMetricsTable: React.FC<BenchmarkMetricsTableProps> = ({
  data,
  className = "",
}) => {
  const calculateMetrics = (data: BenchmarkData[]): AggregatedMetrics => {
    if (data.length === 0) {
      const emptyStats: MetricStats = {
        min: 0,
        max: 0,
        average: 0,
        count: 0,
      };
      return {
        cpu: emptyStats,
        memory: emptyStats,
        duration: emptyStats,
        costs: emptyStats,
      };
    }

    const validData = data.filter(
      (item) =>
        item.cpu !== null &&
        item.cpu !== undefined &&
        item.memory !== null &&
        item.memory !== undefined &&
        item.duration !== null &&
        item.duration !== undefined &&
        item.costs !== null &&
        item.costs !== undefined,
    );

    if (validData.length === 0) {
      const emptyStats: MetricStats = {
        min: 0,
        max: 0,
        average: 0,
        count: 0,
      };
      return {
        cpu: emptyStats,
        memory: emptyStats,
        duration: emptyStats,
        costs: emptyStats,
      };
    }

    const metrics = ["cpu", "memory", "duration", "costs"] as const;
    const result: Partial<AggregatedMetrics> = {};

    metrics.forEach((metric) => {
      const values = validData
        .map((item) => item[metric])
        .filter((val) => val !== null && val !== undefined);

      if (values.length > 0) {
        const total = values.reduce((sum, val) => sum + val, 0);
        result[metric] = {
          min: Math.min(...values),
          max: Math.max(...values),
          average: total / values.length,
          count: values.length,
        };
      } else {
        result[metric] = { min: 0, max: 0, average: 0, count: 0 };
      }
    });

    return result as AggregatedMetrics;
  };

  const aggregated = calculateMetrics(data);

  const formatNumber = (value: number, decimals: number = 2): string => {
    if (value === 0) return "0";
    if (value < 0.01 && value > 0) return "< 0.01";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const tableData = [
    {
      metric: "CPU usage",
      unit: "seconds",
      min: formatNumber(aggregated.cpu.min),
      max: formatNumber(aggregated.cpu.max),
      average: formatNumber(aggregated.cpu.average),
    },
    {
      metric: "Memory usage",
      unit: "seconds",
      min: formatNumber(aggregated.memory.min),
      max: formatNumber(aggregated.memory.max),
      average: formatNumber(aggregated.memory.average),
    },
    {
      metric: "Duration",
      unit: "seconds",
      min: formatNumber(aggregated.duration.min),
      max: formatNumber(aggregated.duration.max),
      average: formatNumber(aggregated.duration.average),
    },
    {
      metric: "Credits",
      unit: "credits",
      min: formatNumber(aggregated.costs.min),
      max: formatNumber(aggregated.costs.max),
      average: formatNumber(aggregated.costs.average),
    },
  ];

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800 bg-opacity-50 rounded-lg p-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-4 font-normal">Metric</th>
              <th className="text-right py-3 px-4 font-normal">Minimum</th>
              <th className="text-right py-3 px-4 font-normal">Maximum</th>
              <th className="text-right py-3 px-4 font-normal">Average</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.metric}>
                <td className="py-2 px-4">
                  <div>
                    <div className="font-medium">{row.metric}</div>
                    <div className="text-sm text-gray-400">({row.unit})</div>
                  </div>
                </td>
                <td className="py-2 px-4 text-right">{row.min}</td>
                <td className="py-2 px-4 text-right">{row.max}</td>
                <td className="py-2 px-4 text-right">{row.average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

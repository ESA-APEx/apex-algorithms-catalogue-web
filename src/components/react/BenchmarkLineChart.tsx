import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LineController,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import type { BenchmarkData } from "@/types/models/benchmark";
import { formatDate } from "date-fns";
import { formatNumber } from "@/lib/utils";

// Register Chart.js components
ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface BenchmarkLineChartProps {
  data: BenchmarkData[];
  metric: "cpu" | "memory" | "costs" | "duration";
  loading?: boolean;
  error?: string | null;
  className?: string;
  config: {
    label: string;
    borderColor: string;
    backgroundColor: string;
    pointBackgroundColor: string;
  };
}

export const BenchmarkLineChart: React.FC<BenchmarkLineChartProps> = ({
  data,
  metric,
  config,
  loading = false,
  error = null,
  className = "",
}) => {
  const chartRef = useRef<ChartJS | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || loading || error || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const chartData = data
      .filter((item) => item[metric] !== null && item[metric] !== undefined)
      .map((item) => ({
        x: new Date(item.start_time).getTime(),
        y: item[metric],
        status: item.status,
      }))
      .sort((a, b) => a.x - b.x);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: config.label,
            data: chartData,
            borderColor: config.borderColor,
            backgroundColor: config.backgroundColor,
            pointBackgroundColor: config.pointBackgroundColor,
            pointBorderColor: config.pointBackgroundColor,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: config.label,
            color: "white",
            font: {
              size: 17.6,
              weight: "normal",
              family: "'NotesEsa', system-ui, sans-serif",
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            bodyFont: {
              family: "'NotesEsa', system-ui, sans-serif",
            },
            titleFont: {
              family: "'NotesEsa', system-ui, sans-serif",
            },
            callbacks: {
              title: function (context) {
                if (context[0]?.parsed?.x) {
                  const date = new Date(context[0].parsed.x);
                  return formatDate(date, "yyyy-MM-dd HH:mm:ss");
                }
                return "";
              },
              label: function (context) {
                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              displayFormats: {
                day: "MMM dd",
                hour: "MMM dd HH:mm",
                minute: "HH:mm",
                second: "HH:mm:ss",
              },
              tooltipFormat: "MMM dd, yyyy HH:mm:ss",
            },
            ticks: {
              color: "white",
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 50,
              font: {
                family: "'NotesEsa', system-ui, sans-serif",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: config.label,
              color: "white",
              font: {
                family: "'NotesEsa', system-ui, sans-serif",
              },
            },
            ticks: {
              color: "white",
              font: {
                family: "'NotesEsa', system-ui, sans-serif",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
        elements: {
          point: {
            hoverBackgroundColor: "white",
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, loading, error, metric, config]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  if (loading || error || data.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800 bg-opacity-50 rounded-lg p-6 ${className}`}>
      <div className="relative h-96">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

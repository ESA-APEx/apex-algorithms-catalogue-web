import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
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

const columnHelper = createColumnHelper<BenchmarkSummary>();

export const AdminBenchmarksTable: React.FC<AdminBenchmarksTableProps> = ({
  className,
}) => {
  const [data, setData] = useState<BenchmarkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  const columns = useMemo(
    () => [
      columnHelper.accessor("scenario_id", {
        header: "Scenario ID",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("runs", {
        header: "Total Runs",
        cell: (info) => formatNumber(info.getValue()),
        enableSorting: true,
      }),
      columnHelper.accessor("success_count", {
        header: "Success",
        cell: (info) => formatNumber(info.getValue()),
        enableSorting: true,
      }),
      columnHelper.accessor("failed_count", {
        header: "Failed",
        cell: (info) => formatNumber(info.getValue()),
        enableSorting: true,
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => {
          const benchmark = info.row.original;
          const successRate = calculateSuccessRate(
            benchmark.success_count,
            benchmark.runs,
          );
          const status = getBenchmarkStatus(benchmark);

          return (
            <div className="flex gap-2 items-center">
              <BenchmarkStatusBadge status={status} />
              <span className="font-medium text-gray-300">
                ({successRate}%)
              </span>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
  });

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

  return (
    <div className={className}>
      <h2 className="p-4 text-2xl text-white">Benchmark Results</h2>

      <div className="flex items-end text-white px-4 mb-6">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            id="scenario-filter"
            name="scenario-filter"
            placeholder="Search scenario..."
            value={
              (table.getColumn("scenario_id")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("scenario_id")?.setFilterValue(event.target.value)
            }
            className="max-w-sm text-gray-900"
          />
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
        <div className="space-y-4">
          <Table className="text-white">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center space-x-1"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ▴",
                            desc: " ▾",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Input } from "./Input";
import { Button } from "./Button";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  loading?: boolean;
  className?: string;
  label?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  label = "Benchmark testing period",
  loading = false,
  className = "",
}) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-sm mb-1">{label}</div>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex bg-gray-500/20 rounded-md">
          <label
            htmlFor="start-date"
            className="flex items-center text-sm px-3"
          >
            From
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={endDate || today}
            className="text-gray-900"
          />
        </div>
        <div className="flex bg-gray-500/20 rounded-md">
          <label htmlFor="end-date" className="flex items-center text-sm px-3">
            To
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
            max={today}
            className="text-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onApply} disabled={loading} variant="default">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

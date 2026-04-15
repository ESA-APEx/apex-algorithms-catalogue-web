import type { BenchmarkStatusKey } from "@/types/models/benchmark";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { isFeatureEnabled } from "@/lib/featureflag";
import { statusDescriptions } from "@/lib/benchmark-status";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";

interface BenchmarkStatusBadgeProps {
  status: BenchmarkStatusKey;
  forcedEnabled?: boolean;
  className?: string;
}

const statusVariant = cva("inline-flex w-2 h-2 rounded-full", {
  variants: {
    status: {
      healthy: "bg-green-600",
      warning: "bg-yellow-600",
      critical: "bg-red-600",
      "no benchmark": "bg-gray-500",
    },
  },
  defaultVariants: {
    status: "no benchmark",
  },
});

export const BenchmarkStatusBadge = ({
  status,
  forcedEnabled = false,
  className,
}: BenchmarkStatusBadgeProps) => {
  const isEnabled =
    isFeatureEnabled(window.location.href, "benchmarkStatus") || forcedEnabled;
  const [open, setOpen] = useState(false);

  return isEnabled ? (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn("flex items-center gap-2", className)}
          data-testid="benchmark-status-badge"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span className={cn(statusVariant({ status }))}></span>
          <span className="capitalize">{status}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <p className="text-sm">
          {statusDescriptions[status]}
        </p>
      </PopoverContent>
    </Popover>
  ) : null;
};

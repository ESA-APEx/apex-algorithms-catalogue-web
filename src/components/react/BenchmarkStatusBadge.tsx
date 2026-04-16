import { type BenchmarkStatusInfo } from "@/lib/benchmark-status";
import { isFeatureEnabled } from "@/lib/featureflag";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface BenchmarkStatusBadgeProps {
  status: BenchmarkStatusInfo;
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
          <span className={cn(statusVariant({ status: status.status }))}></span>
          <span className="capitalize" dangerouslySetInnerHTML={{ __html: status.status }}></span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: status.description }}></p>
      </PopoverContent>
    </Popover>
  ) : null;
};

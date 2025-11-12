import type { BenchmarkStatusKey } from "@/types/models/benchmark";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { isFeatureEnabled } from "@/lib/featureflag";

interface BenchmarkStatusBadgeProps {
  status: BenchmarkStatusKey;
  forcedEnabled?: boolean;
}

const statusVariant = cva("inline-flex w-2 h-2 rounded-full", {
  variants: {
    status: {
      stable: "bg-green-600",
      unstable: "bg-yellow-600",
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
}: BenchmarkStatusBadgeProps) => {
  const isEnabled =
    isFeatureEnabled(window.location.href, "benchmarkStatus") || forcedEnabled;

  return isEnabled ? (
    <div
      className="flex items-center gap-2"
      data-testid="benchmark-status-badge"
    >
      <span className={cn(statusVariant({ status }))}></span>
      <span className="capitalize">{status}</span>
    </div>
  ) : null;
};

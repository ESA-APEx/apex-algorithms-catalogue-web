import type { CertificationCategory } from "@/types/models/algorithm";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface CertificationBadgeProps {
  category?: CertificationCategory;
  className?: string;
}

export const CertificationBadge = ({
  category,
  className = "",
}: CertificationBadgeProps) => {
  const isValidated = category === "validated";
  const label = isValidated ? "Validated" : "Contributed";
  const description = isValidated
    ? "This service's scientific validation category has been reviewed and accepted during APEx onboarding. This is separate from benchmark status."
    : "This service has been contributed to APEx and has not undergone scientific validation review.";
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
            isValidated
              ? "border-blue-300 bg-blue-100 text-blue-900"
              : "border-gray-300 bg-gray-100 text-gray-700"
          } ${className}`}
          data-testid="certification-badge"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {isValidated && <span aria-hidden="true" className="mr-1">✓</span>}
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <p className="text-sm">{description}</p>
      </PopoverContent>
    </Popover>
  );
};

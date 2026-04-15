import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Info } from "lucide-react";
import { BenchmarkStatusBadge } from "./BenchmarkStatusBadge";
import { statusDescriptions, statusOrder } from "@/lib/benchmark-status";

export const BenchmarkInfoPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Info className="w-4 h-4 text-white rounded-full hover:bg-brand-teal-50/20 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="relative w-[300px]">
        <article>
          <p className="text-sm mb-2">
            The benchmark status is determined based on the algorithm's latest test run:
          </p>
          <ul className="text-sm space-y-1">
            {statusOrder.map((s) => (
              <li key={s}>
                <BenchmarkStatusBadge className="inline-flex" status={s} forcedEnabled />
                <span className="ml-1 lowercase">({statusDescriptions[s]})</span>
              </li>
            ))}
          </ul>
        </article>
      </PopoverContent>
    </Popover>
  );
};

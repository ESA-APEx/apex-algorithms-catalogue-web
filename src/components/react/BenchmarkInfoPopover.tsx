import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Info } from "lucide-react";
import { BenchmarkStatusBadge } from "./BenchmarkStatusBadge";

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
            <li>
              <BenchmarkStatusBadge className="inline-flex" status="no benchmark" />
              <span className="ml-1">(no test benchmark found)</span>
            </li>
            <li>
              <BenchmarkStatusBadge className="inline-flex" status="critical" />
              <span className="ml-1">
                (the service execution failed in the create-job or run-job phase)
              </span>
            </li>
            <li>
              <BenchmarkStatusBadge className="inline-flex" status="unstable" />
              <span className="ml-1">
                (the service execution failed in one of the other phases)
              </span>
            </li>
            <li>
              <BenchmarkStatusBadge className="inline-flex" status="stable" />
              <span className="ml-1">(everything executed successfully)</span>
            </li>
          </ul>
        </article>
      </PopoverContent>
    </Popover>
  );
};

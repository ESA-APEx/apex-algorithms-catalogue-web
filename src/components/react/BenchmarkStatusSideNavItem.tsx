import { isFeatureEnabled } from "@/lib/featureflag";
import { BenchmarkInfoPopover } from "./BenchmarkInfoPopover"
import { BenchmarkStatus } from "./BenchmarkStatus"

interface BenchmarkStatusSideNavItemProps {
    scenarioId: string
}

export const BenchmarkStatusSideNavItem = ({ scenarioId }: BenchmarkStatusSideNavItemProps) => {
    const isEnabled = isFeatureEnabled(window.location.href, 'benchmarkStatus');

    return isEnabled ? (
        <li data-testid="benchmark-status-sidenav">
            <div className="text-white mb-1 flex items-center gap-2">
                <span>Benchmark status</span>
                <BenchmarkInfoPopover />
            </div>
            <BenchmarkStatus scenarioId={scenarioId} />
        </li>
    ) : null;
}
import { useEffect, useState } from 'react';
import type { BenchmarkSummary, BenchmarkStatusKey } from '@/types/models/benchmark';
import { isFeatureEnabled } from '@/lib/featureflag';
import { getBenchmarkSummary } from '@/lib/api';
import { BenchmarkStatusBadge } from './BenchmarkStatusBadge';

interface BenchmarkStatusProps {
    scenarioId: string;
    data?: BenchmarkSummary[];
}

export const STATUS_THRESHOLD = {
    stable: 0.75,
    unstable: 0,
    'no benchmark': null,
}

export const getBenchmarkStatus = (data?: BenchmarkSummary): BenchmarkStatusKey => {
    if (data) {
        const successRate = data.success_count / data.runs;

        if (successRate >= STATUS_THRESHOLD.stable) {
            return 'stable';
        }
        return 'unstable';
    }
    return 'no benchmark';
}

export const BenchmarkStatus = ({ scenarioId, data }: BenchmarkStatusProps) => {
    const isEnabled = isFeatureEnabled(window.location.href, 'benchmarkStatus');

    const [status, setStatus] = useState<BenchmarkStatusKey>();

    const fetchData = async () => {
        try {
            const result = await getBenchmarkSummary();
            if (result) {
                const summaryData = result.find(item => item.scenario_id === scenarioId);
                setStatus(getBenchmarkStatus(summaryData));
            } else {
                setStatus('no benchmark');
                console.error("The response is not ok, setting it to fallback 'no benchmark'.")
            }
        } catch (error) {
            setStatus('no benchmark');
            console.error('Failed to fetch benchmark status', error);
        }
    };

    useEffect(() => {
        if (isEnabled) {
            if (data) {
                setStatus(getBenchmarkStatus(data.find(item => item.scenario_id === scenarioId)))
            } else {
                fetchData();
            }
        }
    }, []);

    return isEnabled && (
        <>
            {
                status ? 
                    (
                        <BenchmarkStatusBadge status={status} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <img className="w-3 h-3 animate-spin" src="/icons/icon-spinner.svg" />
                            <span>loading...</span>
                        </div>
                    )
            }
        </>
    );
}
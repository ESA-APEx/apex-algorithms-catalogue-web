import { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BenchmarkSummary } from '@/types/models/benchmark';
import { isFeatureEnabled } from '@/lib/featureflag';

interface BenchmarkStatusProps {
    scenarioId: string;
    data?: BenchmarkSummary;
}

const STATUS_THRESHOLD = {
    stable: 0.75,
    unstable: 0
}

type BenchmarkStatusKey = keyof typeof STATUS_THRESHOLD | 'no benchmark';

const getBenchmarkStatus = (data?: BenchmarkSummary): BenchmarkStatusKey => {
    if (data) {
        const successRate = data.success_count / data.runs;
        if (successRate >= STATUS_THRESHOLD.stable) {
            return 'stable';
        } 
        if (successRate >= STATUS_THRESHOLD.unstable) {
            return 'unstable';
        }
        return  'no benchmark';
    }
    return 'no benchmark';
}

const statusVariant = cva('inline-flex w-2 h-2 rounded-full', {
    variants: {
        status: {
            'stable': 'bg-green-600',
            'unstable': 'bg-yellow-600',
            'no benchmark': 'bg-gray-500',
        },
    },
    defaultVariants: {
        status: 'no benchmark',
    },
})

export const BenchmarkStatus = ({ scenarioId, data }: BenchmarkStatusProps) => {
    const isEnabled = isFeatureEnabled(window.location.href, 'benchmarkStatus');

    const [status, setStatus] = useState<BenchmarkStatusKey>();

    const fetchData = async () => {
        try {
            const response = await fetch('/api/services/benchmarks.json');
            if (response.ok) {
                const result = await response.json() as BenchmarkSummary[];
                const summaryData = result.find(item => item.scenario_id === scenarioId);
                setStatus(getBenchmarkStatus(summaryData));
            }
        } catch (_error) {
            setStatus('no benchmark');
        }
    };

    useEffect(() => {
        if (isEnabled) {
            if (data) {
                setStatus(getBenchmarkStatus(data))
            } else {
                fetchData();
            }
        }
    }, []);

    return isEnabled && (
        <div className="flex items-center gap-2">
            {
                status ? 
                    (
                        <>
                            <span className={cn(statusVariant({ status }))}></span>
                            <span className="capitalize">{status}</span>
                        </>
                    ) : (
                        <>
                            <img className="w-3 h-3 animate-spin" src="/icons/icon-spinner.svg" />
                            <span>loading...</span>
                        </>
                    )
            }
        </div>
    );
}
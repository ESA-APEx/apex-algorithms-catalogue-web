import { useEffect, useState } from 'react';
import type { BenchmarkSummary, BenchmarkStatusKey } from '@/types/models/benchmark';
import { isFeatureEnabled } from '@/lib/featureflag';
import { getBenchmarkSummary } from '@/lib/api';
import { BenchmarkStatusBadge } from './BenchmarkStatusBadge';
import { getBenchmarkStatus } from '@/lib/benchmark-status';
import { Spinner } from './Spinner';

interface BenchmarkStatusProps {
    scenarioId: string;
    data?: BenchmarkSummary[];
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
    }, [data, scenarioId]);

    return isEnabled && (
        <>
            {
                status ? 
                    (
                        <BenchmarkStatusBadge status={status} />
                    ) : (
                        <Spinner />
                    )
            }
        </>
    );
}
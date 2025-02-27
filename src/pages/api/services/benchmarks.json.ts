import type { APIRoute } from 'astro';
import type { BenchmarkSummary } from '@/types/models/benchmark';
import { executeQuery } from '@/lib/db';
import { getUrls } from '@/lib/api';

export const GET: APIRoute = async () => {
    const query = `
        SELECT count()::INTEGER                                                                                                 as "runs", 
               round(avg(case when "test:outcome" = 'passed' then "usage:cpu:cpu-seconds" else null end), 2)                    as "cpu_avg",
               round(stddev_samp(case when "test:outcome" = 'passed' then "usage:cpu:cpu-seconds" else null end), 2)            as "cpu_stddev_samp",
               round(stddev_pop(case when "test:outcome" = 'passed' then "usage:cpu:cpu-seconds" else null end), 2)             as "cpu_stddev_pop",
               round(avg(case when "test:outcome" = 'passed' then "usage:duration:seconds" else null end), 2)                   as "duration_avg",
               round(avg(case when "test:outcome" = 'passed' then "costs" else null end), 0)                                    as "cost_avg",
               "scenario_id",
               round(avg(case when "test:outcome" = 'passed' then "usage:network_received:b" else null end), 2)                 as "network_received_avg",
               round(avg(case when "test:outcome" = 'passed' then "usage:input_pixel:mega-pixel" else null end), 2)             as "input_pixels",
               SUM(case when "test:outcome" = 'passed' then 1 else 0 end)::INTEGER                                              as "success_count",
               SUM(case when "test:outcome" != 'passed' then 1 else 0 end)::INTEGER                                             as "failed_count",
        FROM parquet_scan([${(await getUrls()).map(url => `"${url}"`)}])
        WHERE "scenario_id" IS NOT NULL
        GROUP BY "scenario_id"; 
    `; 

    try {
        const data = (await executeQuery(query) as BenchmarkSummary[]);
        return Response.json(
            data.sort(
                (s1: BenchmarkSummary, s2: BenchmarkSummary) => (s1.scenario_id || '').localeCompare(s2.scenario_id || '')
            )
        );
    } catch (error) {
        console.error("Error fetching full overview:", error);
        return Response.error();
    }
}
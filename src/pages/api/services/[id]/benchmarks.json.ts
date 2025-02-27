import type { APIRoute } from "astro";
import type { BenchmarkData } from '@/types/models/benchmark';

import { executeQuery } from "@/lib/db";
import { getUrls } from '@/lib/api';

export const GET: APIRoute = async ({ params }) => {
    const scenario = params.id
    const query = `
        SELECT round("usage:cpu:cpu-seconds", 2)::INTEGER                     as cpu, 
               round("usage:memory:mb-seconds", 2)::INTEGER                   as memory, 
               costs::INTEGER                                                 as costs, 
               round("test:duration", 2)                                      as duration,
               strptime("test:start:datetime", '%Y-%m-%dT%H:%M:%SZ')          as start_time
        FROM parquet_scan([${(await getUrls()).map(url => `"${url}"`)}])
        WHERE "scenario_id" = '${scenario}'
          AND "test:outcome" = 'passed'
        ORDER BY "test:start:datetime" DESC
    `
    try {
        const data = await executeQuery(query) as BenchmarkData[];
        return Response.json({
            scenario,
            data
        });
    } catch (error) {
        console.error(`Error fetching scenario data for ${scenario}:`, error);
        return Response.error()
    }
}
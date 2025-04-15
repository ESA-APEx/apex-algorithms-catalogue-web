import type { APIRoute } from 'astro';
import type { BenchmarkData } from '@/types/models/benchmark';

import { executeQuery } from '@/lib/db';
import { getUrls, isCacheExpired } from '@/lib/parquet-datasource';

/**
 * @openapi
 * /api/services/{id}/benchmarks.json:
 *   get:
 *     summary: Retrieve benchmark data for a specific service or scenario
 *     description: Fetches benchmark details for a given service ID or scenario ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique service or scenario identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A benchmark data object for the specified service or scenario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scenario_id:
 *                   type: string
 *                   description: The ID of the service or scenario for which data is retrieved.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cpu:
 *                         type: integer
 *                         description: CPU usage in seconds.
 *                       costs:
 *                         type: integer
 *                         description: Costs associated with the benchmark.
 *                       memory:
 *                         type: integer
 *                         description: Memory usage in MB-seconds.
 *                       duration:
 *                         type: number
 *                         description: Duration of the test in seconds.
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         description: The start time of the test in ISO 8601 format.
 *                       input_pixel:
 *                         type: number
 *                         description: Input pixel usage in mega-pixels.
 *                       max_executor_memory:
 *                         type: number
 *                         description: Maximum executor memory used in GB.
 *                       network_received:
 *                         type: number
 *                         description: Amount of data received over the network in bytes.
 *                       status:
 *                         type: string
 *                         description: Status of the benchmark ('success' or 'failed').
 *       500:
 *         description: An error occurred while fetching the scenario data.
 */
export const GET: APIRoute = async ({ params }) => {
    const scenario = params.id
    try {
        if (isCacheExpired()) {
            await executeQuery(
                `
                    CREATE OR REPLACE TABLE benchmarks AS SELECT * FROM parquet_scan([${(await getUrls()).map(url => `"${url}"`)}]);
                `);
        }
        const query = `
            SELECT round("usage:cpu:cpu-seconds", 2)::INTEGER                  as cpu, 
                round("usage:memory:mb-seconds", 2)::INTEGER                   as memory, 
                costs::INTEGER                                                 as costs, 
                round("test:duration", 2)                                      as duration,
                round("usage:input_pixel:mega-pixel", 2)                       as input_pixel,
                round("usage:max_executor_memory:gb", 2)                       as max_executor_memory,
                round("usage:network_received:b", 2)                           as network_received,
                strptime("test:start:datetime", '%Y-%m-%dT%H:%M:%SZ')          as start_time,
                "test:outcome"                                                 as status
            FROM benchmarks
            WHERE "scenario_id" = '${scenario}'
            ORDER BY "test:start:datetime" DESC
        `
        const data = await executeQuery(query) as BenchmarkData[];
        return Response.json({
            scenario_id: scenario,
            data
        });
    } catch (error) {
        const message = `Fetching benchmark data for service ${scenario} failed.`;
        console.error(message, error);

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return new Response(JSON.stringify({ message }), { status: 500, headers });
    }
}
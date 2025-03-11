import type { APIRoute } from 'astro';
import type { BenchmarkSummary } from '@/types/models/benchmark';
import { executeQuery } from '@/lib/db';
import { getUrls } from '@/lib/parquet-datasource';

/**
 * @openapi
 * /api/services/benchmarks.json:
 *   get:
 *     summary: Retrieve benchmark statistics from all services
 *     description: Fetches aggregated benchmark statistics including CPU usage, duration, costs, network received, input pixels, and success/failure counts.
 *     responses:
 *       200:
 *         description: A list of benchmark summary results grouped by scenario ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   runs:
 *                     type: integer
 *                     description: Total number of test runs.
 *                   scenario_id:
 *                     type: string
 *                     description: Unique identifier for the scenario.
 *                   success_count:
 *                     type: integer
 *                     description: Total number of successful runs.
 *                   failed_count:
 *                     type: integer
 *                     description: Total number of failed runs.
 *       500:
 *         description: Server error fetching benchmark statistics.
 *     tags:
 *       - Benchmark
 */
export const GET: APIRoute = async () => {
    try {
        const query = `
            SELECT count()::INTEGER                                                   as "runs",
                "scenario_id",
                SUM(case when "test:outcome" = 'passed' then 1 else 0 end)::INTEGER   as "success_count",
                SUM(case when "test:outcome" != 'passed' then 1 else 0 end)::INTEGER  as "failed_count",
            FROM parquet_scan([${(await getUrls()).map(url => `"${url}"`)}])
            WHERE "scenario_id" IS NOT NULL
            GROUP BY "scenario_id"; 
        `; 

        const data = (await executeQuery(query) as BenchmarkSummary[]);
        return Response.json(
            data.sort(
                (s1: BenchmarkSummary, s2: BenchmarkSummary) => (s1.scenario_id || '').localeCompare(s2.scenario_id || '')
            )
        );
    } catch (error) {
        console.error("Error fetching full overview:", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
import type { APIRoute } from "astro";
import type { BenchmarkSummary } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  getUrls,
  isCacheExpired,
  updateCacheExpiration,
  PARQUET_MONTH_COVERAGE,
} from "@/lib/parquet-datasource";

/**
 * @openapi
 * /api/services/benchmarks.json:
 *   get:
 *     summary: Retrieve benchmark statistics from all services
 *     description: Fetches aggregated benchmark statistics including CPU usage, duration, costs, network received, input pixels, and success/failure counts for the default time period.
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
 *                   scenario_id:
 *                     type: string
 *                     description: Unique identifier for the scenario.
 *                   status:
 *                     type: string
 *                     description: Status of the benchmark ('stable', 'unstable', 'critical', or 'no benchmark').
 *                   last_test_datetime:
 *                     type: string
 *                     format: date-time
 *                     description: The datetime of the most recent test run for this scenario.
 *       500:
 *         description: Server error fetching benchmark statistics.
 *     tags:
 *       - Benchmark
 */
export const GET: APIRoute = async () => {
  try {
    if (isCacheExpired()) {
      console.log("Cache expired, updating benchmarks table");
      await executeQuery(
        `CREATE OR REPLACE TABLE benchmarks AS SELECT * FROM parquet_scan([${(await getUrls()).map((url) => `"${url}"`)}]);`,
      );
      updateCacheExpiration();
    }

    // Use default date filter for the last N months
    const dateFilter = `AND CAST("test:start:datetime" AS TIMESTAMP) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${PARQUET_MONTH_COVERAGE}' MONTH`;

    const query = `
      WITH last_runs AS (
          SELECT *,
              ROW_NUMBER() OVER (
                  PARTITION BY "scenario_id"
                  ORDER BY CAST("test:start:datetime" AS TIMESTAMP) DESC
              ) AS rn
          FROM benchmarks
          WHERE "scenario_id" IS NOT NULL
            ${dateFilter}
      )
      SELECT
          "scenario_id",
          CASE
              WHEN "test:outcome" = 'failed' AND "test:phase:end" IN ('create-job', 'run-job') THEN 'critical'
              WHEN "test:outcome" = 'failed'                                                    THEN 'unstable'
              WHEN "test:outcome" = 'passed'                                                    THEN 'stable'
              ELSE 'no benchmark'
          END AS status,
          CAST("test:start:datetime" AS TIMESTAMP) AS "last_test_datetime"
      FROM last_runs
      WHERE rn = 1
      ORDER BY "scenario_id";
    `;

    const data = (await executeQuery(query)) as BenchmarkSummary[];
    return Response.json(data);
  } catch (error) {
    const message = "Fetching benchmark statistics from all services failed.";
    console.error(message, error);

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

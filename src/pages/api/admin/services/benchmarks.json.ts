import type { APIRoute } from "astro";
import type { AdminBenchmarkSummary } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  PARQUET_MONTH_COVERAGE,
  getUrlsFromRequest,
} from "@/lib/parquet-datasource";
import { canAccessBenchmarkData } from "@/lib/api-validation";
import { isFeatureEnabled } from "@/lib/featureflag";

/**
 * @openapi
 * /api/admin/services/benchmarks.json:
 *   get:
 *     summary: Admin API to query benchmark statistics
 *     description: Comprehensive benchmark data API for admin dashboard with date filtering.
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering benchmarks (YYYY-MM-DD format).
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering benchmarks (YYYY-MM-DD format).
 *     responses:
 *       200:
 *         description: Benchmark statistics with metadata.
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
 *                   last_test_datetime:
 *                     type: string
 *                     format: date-time
 *                     description: The datetime of the most recent test run for this scenario.
 *                   last_test_phase:
 *                     type: string
 *                     description: The phase of the most recent test run.
 *                   status:
 *                     type: string
 *                     description: The status of the most recent test run ('healthy', 'warning', 'critical', or 'no benchmark').
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the validation failure.
 *       500:
 *         description: Server error fetching benchmark statistics.
 *     tags:
 *       - Admin
 *       - Benchmark
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const urlResponse = await getUrlsFromRequest(request);
    if (urlResponse instanceof Response) {
      return urlResponse;
    }

    const { startDate, endDate, urls } = urlResponse;

    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = `AND CAST("test:start:datetime" AS TIMESTAMP) >= '${startDate.toISOString()}'
                    AND CAST("test:start:datetime" AS TIMESTAMP) <= '${endDate.toISOString()}'`;
    } else {
      dateFilter = `AND CAST("test:start:datetime" AS TIMESTAMP) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${PARQUET_MONTH_COVERAGE}' MONTH`;
    }

    const query = `
      WITH aggregated AS (
        SELECT
          count()::INTEGER as "runs",
          "scenario_id",
          SUM(case when "test:outcome" = 'passed' then 1 else 0 end)::INTEGER as "success_count",
          SUM(case when "test:outcome" != 'passed' then 1 else 0 end)::INTEGER as "failed_count",
          MAX(CAST("test:start:datetime" AS TIMESTAMP)) as "last_test_datetime"
        FROM parquet_scan([${urls.map((url) => `"${url}"`)}])
        WHERE "scenario_id" IS NOT NULL
          ${dateFilter}
        GROUP BY "scenario_id"
      ),
      last_runs AS (
        SELECT
          "scenario_id",
          "test:outcome",
          "test:phase:end",
          ROW_NUMBER() OVER (
            PARTITION BY "scenario_id"
            ORDER BY CAST("test:start:datetime" AS TIMESTAMP) DESC
          ) AS rn
        FROM parquet_scan([${urls.map((url) => `"${url}"`)}])
        WHERE "scenario_id" IS NOT NULL
          ${dateFilter}
      )
      SELECT
        a."runs",
        a."scenario_id",
        a."success_count",
        a."failed_count",
        a."last_test_datetime",
        lr."test:phase:end" as last_test_phase,
        CASE
          WHEN lr."test:outcome" = 'failed' AND lr."test:phase:end" IN ('create-job', 'run-job') THEN 'critical'
          WHEN lr."test:outcome" = 'failed'                                                       THEN 'warning'
          WHEN lr."test:outcome" = 'passed'                                                       THEN 'healthy'
          ELSE 'no benchmark'
        END AS status
      FROM aggregated a
      JOIN last_runs lr ON a."scenario_id" = lr."scenario_id" AND lr.rn = 1
      ORDER BY a."scenario_id";
    `;

    let data = (await executeQuery(query)) as AdminBenchmarkSummary[];

    if (!isFeatureEnabled(request.url, "basicAuth")) {
      data = data.filter((benchmark) => {
        return canAccessBenchmarkData(
          benchmark.scenario_id,
          locals.user?.emailDomain as string,
        );
      });
    }

    return Response.json(data);
  } catch (error) {
    const message = "Fetching admin benchmark statistics failed.";
    console.error(message, error);

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

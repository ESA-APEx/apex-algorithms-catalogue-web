import type { APIRoute } from "astro";
import type { BenchmarkSummary } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  PARQUET_MONTH_COVERAGE,
  getUrlsFromRequest,
} from "@/lib/parquet-datasource";

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
 *                   success_rate:
 *                     type: number
 *                     format: float
 *                     description: Success rate as a percentage (0-100).
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
export const GET: APIRoute = async ({ request }) => {
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
      SELECT
        count()::INTEGER as "runs",
        "scenario_id",
        SUM(case when "test:outcome" = 'passed' then 1 else 0 end)::INTEGER as "success_count",
        SUM(case when "test:outcome" != 'passed' then 1 else 0 end)::INTEGER as "failed_count",
      FROM parquet_scan([${urls.map((url) => `"${url}"`)}])
      WHERE "scenario_id" IS NOT NULL
        ${dateFilter}
      GROUP BY "scenario_id"
      ORDER BY "scenario_id";
    `;

    const data = (await executeQuery(query)) as BenchmarkSummary[];

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

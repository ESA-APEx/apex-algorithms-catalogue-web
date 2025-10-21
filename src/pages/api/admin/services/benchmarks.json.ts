import type { APIRoute } from "astro";
import type { BenchmarkSummary } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  getUrls,
  isCacheExpired,
  PARQUET_MONTH_COVERAGE,
} from "@/lib/parquet-datasource";
import { validateDateParameters } from "@/lib/api-validation";

/**
 * @openapi
 * /api/admin/services/benchmarks.json:
 *   get:
 *     summary: Admin API to query benchmark statistics with advanced filtering
 *     description: Comprehensive benchmark data API for admin dashboard with date filtering, scenario filtering, and flexible querying capabilities.
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering benchmarks (YYYY-MM-DD format). Required if end date is provided.
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering benchmarks (YYYY-MM-DD format). Must be later than start date and not in the future.
 *       - in: query
 *         name: scenarios
 *         schema:
 *           type: string
 *         description: Comma-separated list of scenario IDs to filter by (e.g., "scenario1,scenario2").
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [passed, failed, all]
 *         description: Filter by test outcome status. Default is "all".
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of results to return. Default is 100.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of results to skip for pagination. Default is 0.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [scenario_id, runs, success_count, failed_count, success_rate]
 *         description: Field to sort by. Default is "scenario_id".
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order. Default is "asc".
 *     responses:
 *       200:
 *         description: Benchmark statistics with metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       runs:
 *                         type: integer
 *                         description: Total number of test runs.
 *                       scenario_id:
 *                         type: string
 *                         description: Unique identifier for the scenario.
 *                       success_count:
 *                         type: integer
 *                         description: Total number of successful runs.
 *                       failed_count:
 *                         type: integer
 *                         description: Total number of failed runs.
 *                       success_rate:
 *                         type: number
 *                         format: float
 *                         description: Success rate as a percentage (0-100).
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total_count:
 *                       type: integer
 *                       description: Total number of scenarios matching the filters.
 *                     page_info:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         has_next_page:
 *                           type: boolean
 *                     date_range:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         end:
 *                           type: string
 *                           format: date
 *                     filters_applied:
 *                       type: object
 *                       description: Summary of filters that were applied to the query.
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
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("start") || undefined;
    const endDateParam = url.searchParams.get("end") || undefined;

    const dateValidation = validateDateParameters(startDateParam, endDateParam);
    if (!dateValidation.success) {
      return dateValidation.errorResponse!;
    }

    const { startDate, endDate } = dateValidation;

    let urls: string[];
    if (startDate && endDate) {
      urls = await getUrls(startDateParam, endDateParam);
    } else {
      urls = await getUrls();
    }

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

import type { APIRoute } from "astro";
import type { BenchmarkData } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  getUrls,
  isCacheExpired,
  PARQUET_MONTH_COVERAGE,
} from "@/lib/parquet-datasource";
import { validateDateParameters } from "@/lib/api-validation";

/**
 * @openapi
 * /api/admin/services/{id}/benchmarks.json:
 *   get:
 *     summary: Admin API to query detailed benchmark data for a specific scenario
 *     description: Comprehensive benchmark data API for admin dashboard with date filtering, pagination, sorting, and detailed metrics for a specific scenario.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique scenario identifier
 *         schema:
 *           type: string
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
 *           enum: [start_time, duration, cpu, memory, costs, status]
 *         description: Field to sort by. Default is "start_time".
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order. Default is "desc" (most recent first).
 *       - in: query
 *         name: include_aggregates
 *         schema:
 *           type: boolean
 *         description: Include aggregate statistics in the response. Default is false.
 *     responses:
 *       200:
 *         description: Detailed benchmark data for the specified scenario with metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scenario_id:
 *                   type: string
 *                   description: The ID of the scenario for which data is retrieved.
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
 *                         description: Status of the benchmark ('passed' or 'failed').
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total_count:
 *                       type: integer
 *                       description: Total number of benchmark runs matching the filters.
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
 *                     aggregates:
 *                       type: object
 *                       description: Aggregate statistics (only included if include_aggregates=true).
 *                       properties:
 *                         total_runs:
 *                           type: integer
 *                         success_count:
 *                           type: integer
 *                         failed_count:
 *                           type: integer
 *                         success_rate:
 *                           type: number
 *                         avg_duration:
 *                           type: number
 *                         avg_cpu:
 *                           type: number
 *                         avg_memory:
 *                           type: number
 *                         avg_costs:
 *                           type: number
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
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the scenario was not found.
 *       500:
 *         description: Server error fetching benchmark data.
 *     tags:
 *       - Admin
 *       - Benchmark
 *       - Scenario
 */
export const GET: APIRoute = async ({ params, request }) => {
  const scenario = params.id;

  if (!scenario) {
    return new Response(
      JSON.stringify({ message: "Scenario ID is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

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
        round("usage:cpu:cpu-seconds", 2)::INTEGER as cpu,
        round("usage:memory:mb-seconds", 2)::INTEGER as memory,
        costs::INTEGER as costs,
        round("test:duration", 2) as duration,
        round("usage:input_pixel:mega-pixel", 2) as input_pixel,
        round("usage:max_executor_memory:gb", 2) as max_executor_memory,
        round("usage:network_received:b", 2) as network_received,
        strptime("test:start:datetime", '%Y-%m-%dT%H:%M:%SZ') as start_time,
        "test:outcome" as status
      FROM parquet_scan([${urls.map((url) => `"${url}"`)}])
      WHERE "scenario_id" = '${scenario}'
        ${dateFilter}
      ORDER BY "test:start:datetime" DESC;
    `;

    const data = (await executeQuery(query)) as BenchmarkData[];

    return Response.json(data);
  } catch (error) {
    const message = `Fetching admin benchmark data for scenario ${scenario} failed.`;
    console.error(message, error);

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

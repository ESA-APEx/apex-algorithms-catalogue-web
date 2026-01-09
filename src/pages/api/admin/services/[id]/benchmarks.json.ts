import type { APIRoute } from "astro";
import type { BenchmarkData } from "@/types/models/benchmark";
import { executeQuery } from "@/lib/db";
import {
  PARQUET_MONTH_COVERAGE,
  getUrlsFromRequest,
} from "@/lib/parquet-datasource";
import aclMapping from "@/acl-mapping.json";

/**
 * @openapi
 * /api/admin/services/{id}/benchmarks.json:
 *   get:
 *     summary: Admin API to query detailed benchmark data for a specific scenario
 *     description: Comprehensive benchmark data API for admin dashboard with date filtering.
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
 *         description: Start date for filtering benchmarks (YYYY-MM-DD format).
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering benchmarks (YYYY-MM-DD format).
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
 *         description: Server error fetching benchmark data.
 *     tags:
 *       - Admin
 *       - Benchmark
 *       - Scenario
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const scenario = params.id;

  if (!scenario) {
    return new Response(
      JSON.stringify({ message: "Scenario ID is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // @ts-expect-error
  if (!aclMapping.records[scenario]?.includes(locals.user?.emailDomain)) {
    return new Response(
      JSON.stringify({ message: "Scenario not found." }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

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

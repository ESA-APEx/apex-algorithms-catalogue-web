import type { APIRoute } from "astro";
import type { BenchmarkData } from "@/types/models/benchmark";

import { executeQuery } from "@/lib/db";
import benchmarkMapping from "@/benchmark-mapping.json";
import {
  getUrls,
  isCacheExpired,
  updateCacheExpiration,
  PARQUET_MONTH_COVERAGE,
} from "@/lib/parquet-datasource";

/**
 * @openapi
 * /api/services/{id}/benchmarks.json:
 *   get:
 *     summary: Retrieve benchmark data for a specific algorithm or scenario
 *     description: Fetches benchmark details for a given algorithm ID (which maps to multiple scenarios) or scenario ID using default time period.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique algorithm or scenario identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A benchmark data object for the specified algorithm or scenario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scenario_id:
 *                   type: string
 *                   description: The scenario ID (returned when querying by scenario ID).
 *                 algorithm_id:
 *                   type: string
 *                   description: The algorithm ID (returned when querying by algorithm ID).
 *                 scenario_ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of scenario IDs associated with the algorithm (returned when querying by algorithm ID).
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       scenario_id:
 *                         type: string
 *                         description: The scenario ID for this benchmark entry (included when querying by algorithm ID).
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
 *       500:
 *         description: An error occurred while fetching the scenario data.
 */
export const GET: APIRoute = async ({ params }) => {
  const inputId = params.id as string;
  try {
    if (isCacheExpired()) {
      console.log("Cache expired, updating benchmarks table");
      await executeQuery(
        `CREATE OR REPLACE TABLE benchmarks AS SELECT * FROM parquet_scan([${(await getUrls()).map((url) => `"${url}"`)}]);`,
      );
      updateCacheExpiration();
    }

    const dateFilter = `AND CAST("test:start:datetime" AS TIMESTAMP) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${PARQUET_MONTH_COVERAGE}' MONTH`;

    // @ts-expect-error
    const scenarioIds = benchmarkMapping[inputId] || [inputId];

    const query = `
            SELECT round("usage:cpu:cpu-seconds", 2)::INTEGER                  as cpu, 
                round("usage:memory:mb-seconds", 2)::INTEGER                   as memory, 
                costs::INTEGER                                                 as costs, 
                round("test:duration", 2)                                      as duration,
                round("usage:input_pixel:mega-pixel", 2)                       as input_pixel,
                round("usage:max_executor_memory:gb", 2)                       as max_executor_memory,
                round("usage:network_received:b", 2)                           as network_received,
                round("results:proj:bbox:area:utm:km2", 2)                     as area_size,
                strptime("test:start:datetime", '%Y-%m-%dT%H:%M:%SZ')          as start_time,
                "test:outcome"                                                 as status,
                "scenario_id"                                                  as scenario_id
            FROM benchmarks
            WHERE "scenario_id" IN (${scenarioIds.map((id: string) => `'${id}'`).join(", ")})
                ${dateFilter}
            ORDER BY "test:start:datetime" DESC
        `;
    const data = (await executeQuery(query)) as BenchmarkData[];

    return Response.json({
      service_id: inputId,
      data,
    });
  } catch (error) {
    const message = `Fetching benchmark data for ${inputId} failed.`;
    console.error(message, error);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return new Response(JSON.stringify({ message }), { status: 500, headers });
  }
};

import { executeQuery } from "@/lib/db";
import { getUrls } from "@/lib/parquet-datasource";
import type { BenchmarkSummary } from "@/types/models/benchmark";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/services/benchmarks.json";

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

vi.mock("@/lib/parquet-datasource", () => ({
  getUrls: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  updateCacheExpiration: vi.fn(),
  PARQUET_MONTH_COVERAGE: "2",
}));

describe("Public Services API Route: GET /api/services/benchmarks.json", () => {
  const createMockRequest = () =>
    ({
      request: {
        url: "https://example.com/api/services/benchmarks.json",
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mocks for successful cases
    (getUrls as jest.Mock).mockResolvedValue([
      "https://example.com/data.parquet",
    ]);
  });

  it("should return benchmark summary data for all scenarios", async () => {
    const mockData: BenchmarkSummary[] = [
      { scenario_id: "A", runs: 5, success_count: 5, failed_count: 0 },
      { scenario_id: "B", runs: 10, success_count: 8, failed_count: 2 },
    ];

    (executeQuery as jest.Mock).mockResolvedValue(mockData);

    const response = await GET(createMockRequest());

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);

    const jsonData = await response.json();
    expect(jsonData.length).toEqual(2);
    expect(jsonData).toEqual(mockData);

    // Verify that getUrls is called without date parameters (uses default range)
    expect(getUrls).toHaveBeenCalledWith();

    // Verify that the query uses default date filter (last 2 months)
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH",
      ),
    );
  });

  it("should return empty array when no data is available", async () => {
    (executeQuery as jest.Mock).mockResolvedValue([]);

    const response = await GET(createMockRequest());

    expect(response.status).toBe(200);
    const jsonData = await response.json();
    expect(jsonData).toEqual([]);
  });

  it("should return an error response when database query fails", async () => {
    (executeQuery as jest.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await GET(createMockRequest());
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: "Fetching benchmark statistics from all services failed.",
    });
  });

  it("should return an error response when parquet URL generation fails", async () => {
    (getUrls as jest.Mock).mockRejectedValue(
      new Error("Parquet file not found"),
    );

    const response = await GET(createMockRequest());
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: "Fetching benchmark statistics from all services failed.",
    });
  });

  it("should handle large datasets efficiently", async () => {
    // Simulate a large dataset
    const largeMockData: BenchmarkSummary[] = Array.from(
      { length: 100 },
      (_, i) => ({
        scenario_id: `scenario_${i}`,
        runs: Math.floor(Math.random() * 50) + 1,
        success_count: Math.floor(Math.random() * 40),
        failed_count: Math.floor(Math.random() * 10),
      }),
    );

    (executeQuery as jest.Mock).mockResolvedValue(largeMockData);

    const response = await GET(createMockRequest());

    expect(response.status).toBe(200);
    const jsonData = await response.json();
    expect(jsonData.length).toEqual(100);
  });
});

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
  PARQUET_MONTH_COVERAGE: "2",
}));

describe("API Route: GET", () => {
  const createMockRequest = (searchParams: string = "") =>
    ({
      request: {
        url: `https://example.com/api/services/benchmarks.json${searchParams}`,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mocks for successful cases
    (getUrls as jest.Mock).mockResolvedValue([
      "https://example.com/data.parquet",
    ]);
  });

  it("should return benchmark data", async () => {
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
  });

  it("should return an error response when an exception occurs", async () => {
    (getUrls as jest.Mock).mockRejectedValue(new Error("API failure"));

    const response = await GET(createMockRequest());
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: "Fetching benchmark statistics from all services failed.",
    });
  });

  describe("Date parameter validation", () => {
    it("should return benchmark data without date parameters", async () => {
      const mockData: BenchmarkSummary[] = [
        { scenario_id: "A", runs: 5, success_count: 5, failed_count: 0 },
      ];
      (executeQuery as jest.Mock).mockResolvedValue(mockData);

      const response = await GET(createMockRequest());

      expect(response.status).toBe(200);
      const jsonData = await response.json();
      expect(jsonData).toEqual(mockData);

      // Verify that the query was called with default date filter
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH",
        ),
      );
    });

    it("should return benchmark data with valid start and end dates", async () => {
      const mockData: BenchmarkSummary[] = [
        { scenario_id: "B", runs: 3, success_count: 2, failed_count: 1 },
      ];
      (executeQuery as jest.Mock).mockResolvedValue(mockData);

      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31"),
      );

      expect(response.status).toBe(200);
      const jsonData = await response.json();
      expect(jsonData).toEqual(mockData);

      // Verify that the query was called with custom date filter
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "AND CAST(\"test:start:datetime\" AS TIMESTAMP) >= '2025-01-01T00:00:00.000Z'",
        ),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "AND CAST(\"test:start:datetime\" AS TIMESTAMP) <= '2025-01-31T23:59:59.999Z'",
        ),
      );
    });

    it("should return 400 error for invalid start date format", async () => {
      const response = await GET(createMockRequest("?start=invalid-date"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Invalid start date format. Use YYYY-MM-DD.",
      });
    });

    it("should return 400 error for invalid end date format", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=invalid-date"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Invalid end date format. Use YYYY-MM-DD.",
      });
    });

    it("should return 400 error when end date is provided without start date", async () => {
      const response = await GET(createMockRequest("?end=2025-01-31"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Start date is required when end date is provided.",
      });
    });

    it("should return 400 error when end date is before start date", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-31&end=2025-01-01"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "End date must be later than start date.",
      });
    });

    it("should return 400 error when dates are in the future", async () => {
      const response = await GET(
        createMockRequest("?start=2026-01-01&end=2026-01-31"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Start date cannot be in the future.",
      });
    });

    it("should handle edge case with same start and end date", async () => {
      const mockData: BenchmarkSummary[] = [
        { scenario_id: "D", runs: 1, success_count: 1, failed_count: 0 },
      ];
      (executeQuery as jest.Mock).mockResolvedValue(mockData);

      const response = await GET(
        createMockRequest("?start=2025-01-15&end=2025-01-15"),
      );

      expect(response.status).toBe(200);
      const jsonData = await response.json();
      expect(jsonData).toEqual(mockData);

      // Verify that the query includes proper time boundaries for same date
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T00:00:00.000Z"),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T23:59:59.999Z"),
      );
    });
  });
});

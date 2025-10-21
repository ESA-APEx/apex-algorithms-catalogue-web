import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/admin/services/[id]/benchmarks.json";
import { getUrls } from "@/lib/parquet-datasource";
import { executeQuery } from "@/lib/db";
import type { BenchmarkData } from "@/types/models/benchmark";

vi.mock("@/lib/parquet-datasource", () => ({
  getUrls: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  PARQUET_MONTH_COVERAGE: "2",
}));

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

describe("Admin API Route: GET /api/admin/services/{id}/benchmarks.json", () => {
  const mockScenarioId = "scenario-123";
  const mockUrls = ["https://example.com/data.parquet"];

  // Helper function to create mock request with query parameters
  const createMockRequest = (queryParams: string = "") =>
    ({
      params: { id: mockScenarioId },
      request: {
        url: `https://example.com/api/admin/scenarios/${mockScenarioId}/benchmarks.json${queryParams}`,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getUrls as jest.Mock).mockResolvedValue(mockUrls);
  });

  describe("Basic functionality", () => {
    it("should return success for a scenario", async () => {
      const mockData: BenchmarkData[] = [
        {
          cpu: 100,
          memory: 200,
          costs: 300,
          duration: 400.5,
          input_pixel: 500,
          max_executor_memory: 600,
          network_received: 700,
          start_time: "2024-02-27T12:00:00Z",
          status: "success",
        },
      ];

      // Mock scenario exists check, count query, then main query
      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([{ total_count: 1 }])
        .mockResolvedValueOnce(mockData);

      const response = await GET(createMockRequest());
      expect(response.status).toBe(200);
    });

    it("should return 400 when scenario ID is missing", async () => {
      const invalidRequest = {
        params: {},
        request: {
          url: "https://example.com/api/admin/scenarios//benchmarks.json",
        },
      } as any;

      const response = await GET(invalidRequest);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe("Scenario ID is required.");
    });

    it("should return 500 error when an exception occurs", async () => {
      (getUrls as jest.Mock).mockRejectedValue(new Error("API failure"));

      const response = await GET(createMockRequest());

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        `Fetching admin benchmark data for scenario ${mockScenarioId} failed.`,
      );
    });
  });

  describe("Date parameter validation and filtering", () => {
    beforeEach(() => {
      const mockData: BenchmarkData[] = [
        {
          cpu: 150,
          memory: 250,
          costs: 350,
          duration: 450.5,
          input_pixel: 550,
          max_executor_memory: 650,
          network_received: 750,
          start_time: "2025-01-15T10:30:00Z",
          status: "success",
        },
      ];

      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([{ total_count: 1 }])
        .mockResolvedValueOnce(mockData);
    });

    it("should handle valid start and end dates", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31"),
      );
      expect(response.status).toBe(200);

      // Verify custom date filter in SQL
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-01T00:00:00.000Z"),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-31T23:59:59.999Z"),
      );
    });

    it("should use default date range when no dates provided", async () => {
      const response = await GET(createMockRequest());
      expect(response.status).toBe(200);

      // Verify default date filter in SQL
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH",
        ),
      );
    });

    it("should return 400 for invalid start date format", async () => {
      const response = await GET(createMockRequest("?start=invalid-date"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "Invalid start date format. Use YYYY-MM-DD.",
      );
    });

    it("should return 400 for invalid end date format", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=invalid-date"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "Invalid end date format. Use YYYY-MM-DD.",
      );
    });

    it("should return 400 when end date is provided without start date", async () => {
      const response = await GET(createMockRequest("?end=2025-01-31"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "Start date is required when end date is provided.",
      );
    });

    it("should return 400 when end date is before start date", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-31&end=2025-01-01"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "End date must be later than start date.",
      );
    });

    it("should return 400 when dates are in the future", async () => {
      const response = await GET(
        createMockRequest("?start=2026-01-01&end=2026-01-31"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe("Start date cannot be in the future.");
    });

    it("should handle same start and end date", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-15&end=2025-01-15"),
      );

      expect(response.status).toBe(200);
      // Verify proper time boundaries
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T00:00:00.000Z"),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T23:59:59.999Z"),
      );
    });
  });

  describe("URL parameter handling", () => {
    beforeEach(() => {
      const mockData: BenchmarkData[] = [
        {
          cpu: 100,
          memory: 200,
          costs: 300,
          duration: 400.5,
          input_pixel: 500,
          max_executor_memory: 600,
          network_received: 700,
          start_time: "2024-02-27T12:00:00Z",
          status: "success",
        },
      ];

      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([{ total_count: 1 }])
        .mockResolvedValueOnce(mockData);
    });

    it("should call getUrls with date parameters when provided", async () => {
      await GET(createMockRequest("?start=2025-01-01&end=2025-01-31"));

      expect(getUrls).toHaveBeenCalledWith("2025-01-01", "2025-01-31");
    });

    it("should call getUrls without parameters when no dates provided", async () => {
      await GET(createMockRequest());

      expect(getUrls).toHaveBeenCalledWith();
    });

    it("should verify scenario ID is properly included in SQL queries", async () => {
      await GET(createMockRequest());

      // Check that all SQL queries include the scenario ID filter
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(`WHERE "scenario_id" = '${mockScenarioId}'`),
      );
    });
  });
});

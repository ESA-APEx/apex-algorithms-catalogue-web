import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/services/[id]/benchmarks.json";
import { getUrls } from "@/lib/parquet-datasource";
import { executeQuery } from "@/lib/db";

vi.mock("@/lib/parquet-datasource", () => ({
  getUrls: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  PARQUET_MONTH_COVERAGE: "2",
}));

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

describe("API Route: GET /benchmarks/:id", () => {
  const mockScenarioId = "scenario-123";
  const mockUrls = ["https://example.com/data.parquet"];

  const createMockRequest = (queryParams: string = "") =>
    ({
      params: { id: mockScenarioId },
      request: {
        url: `https://example.com/api/services/${mockScenarioId}/benchmarks.json${queryParams}`,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getUrls as jest.Mock).mockResolvedValue(mockUrls);
  });

  it("should return benchmark data for a given scenario", async () => {
    const mockData = [
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

    (executeQuery as jest.Mock).mockResolvedValue(mockData);

    const response = await GET(createMockRequest());
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      scenario_id: mockScenarioId,
      data: mockData,
    });

    expect(getUrls).toHaveBeenCalledOnce();
    expect(executeQuery).toHaveBeenCalled();

    // Verify default date filter is applied
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        `DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH`,
      ),
    );
  });

  it("should return a 500 error response when an exception occurs", async () => {
    (getUrls as jest.Mock).mockRejectedValue(new Error("API failure"));

    const response = await GET(createMockRequest());

    expect(response.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: `Fetching benchmark data for service ${mockScenarioId} failed.`,
    });

    expect(getUrls).toHaveBeenCalledOnce();
    expect(executeQuery).not.toHaveBeenCalled();
  });

  describe("Date parameter validation", () => {
    const mockData = [
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

    beforeEach(() => {
      (executeQuery as jest.Mock).mockResolvedValue(mockData);
    });

    it("should return benchmark data with valid start and end dates", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31"),
      );
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse).toEqual({
        scenario_id: mockScenarioId,
        data: mockData,
      });

      // Verify custom date filter is applied
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          `AND CAST("test:start:datetime" AS TIMESTAMP) >= '2025-01-01T00:00:00.000Z'`,
        ),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          `AND CAST("test:start:datetime" AS TIMESTAMP) <= '2025-01-31T23:59:59.999Z'`,
        ),
      );
    });

    it("should return benchmark data with only start date", async () => {
      const response = await GET(createMockRequest("?start=2025-01-01"));
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse).toEqual({
        scenario_id: mockScenarioId,
        data: mockData,
      });

      // Should use default date filter when only start is provided
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          `DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH`,
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
      expect(executeQuery).not.toHaveBeenCalled();
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
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it("should return 400 error when end date is provided without start date", async () => {
      const response = await GET(createMockRequest("?end=2025-01-31"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Start date is required when end date is provided.",
      });
      expect(executeQuery).not.toHaveBeenCalled();
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
      expect(executeQuery).not.toHaveBeenCalled();
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
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it("should handle same start and end date correctly", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-15&end=2025-01-15"),
      );
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse).toEqual({
        scenario_id: mockScenarioId,
        data: mockData,
      });

      // Verify proper time boundaries for same date
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T00:00:00.000Z"),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-15T23:59:59.999Z"),
      );
    });

    it("should verify SQL query includes scenario ID filter", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31"),
      );

      expect(response.status).toBe(200);
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(`WHERE "scenario_id" = '${mockScenarioId}'`),
      );
    });

    it("should handle URL encoding in query parameters", async () => {
      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31&extra=value"),
      );
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse).toEqual({
        scenario_id: mockScenarioId,
        data: mockData,
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/admin/services/benchmarks.json";
import { getUrlsFromRequest } from "@/lib/parquet-datasource";
import { executeQuery } from "@/lib/db";
import type { BenchmarkSummary } from "@/types/models/benchmark";

vi.mock("@/lib/parquet-datasource", () => ({
  getUrlsFromRequest: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  PARQUET_MONTH_COVERAGE: "2",
}));

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

describe("Admin API Route: GET /api/admin/services/benchmarks.json", () => {
  const mockUrls = ["https://example.com/data.parquet"];

  const createMockRequest = (queryParams: string = "") =>
    ({
      request: {
        url: `https://example.com/api/admin/benchmarks.json${queryParams}`,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getUrlsFromRequest as jest.Mock).mockResolvedValue({
      startDate: undefined,
      endDate: undefined,
      urls: mockUrls,
    });
  });

  describe("Basic functionality", () => {
    it("should return benchmark data with metadata", async () => {
      const mockData: BenchmarkSummary[] = [
        {
          scenario_id: "A",
          runs: 5,
          success_count: 5,
          failed_count: 0,
          last_test_datetime: "2024-11-01T10:00:00Z",
        },
        {
          scenario_id: "B",
          runs: 10,
          success_count: 8,
          failed_count: 2,
          last_test_datetime: "2024-11-02T15:30:00Z",
        },
      ];

      // Mock count query first, then main query
      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ total_count: 2 }])
        .mockResolvedValueOnce([
          { ...mockData[0], success_rate: 100.0 },
          { ...mockData[1], success_rate: 80.0 },
        ]);

      const response = await GET(createMockRequest());

      expect(response.status).toBe(200);
    });

    it("should return 500 error when an exception occurs", async () => {
      (getUrlsFromRequest as jest.Mock).mockRejectedValue(
        new Error("API failure"),
      );

      const response = await GET(createMockRequest());

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        message: "Fetching admin benchmark statistics failed.",
      });
    });
  });

  describe("Date parameter validation and filtering", () => {
    beforeEach(() => {
      const mockData = [
        {
          scenario_id: "A",
          runs: 5,
          success_count: 4,
          failed_count: 1,
          success_rate: 80.0,
        },
      ];
      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ total_count: 1 }])
        .mockResolvedValueOnce(mockData);
    });

    it("should handle valid start and end dates", async () => {
      (getUrlsFromRequest as jest.Mock).mockResolvedValue({
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        endDate: new Date("2025-01-31T23:59:59.999Z"),
        urls: mockUrls,
      });

      const response = await GET(
        createMockRequest("?start=2025-01-01&end=2025-01-31"),
      );
      expect(response.status).toBe(200);

      expect(getUrlsFromRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://example.com/api/admin/benchmarks.json?start=2025-01-01&end=2025-01-31",
        }),
      );

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-01T00:00:00.000Z"),
      );
      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("2025-01-31T23:59:59.999Z"),
      );
    });

    it("should use default date range when no dates provided", async () => {
      (getUrlsFromRequest as jest.Mock).mockResolvedValue({
        startDate: undefined,
        endDate: undefined,
        urls: mockUrls,
      });

      const response = await GET(createMockRequest());
      expect(response.status).toBe(200);

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH",
        ),
      );
    });

    it("should return 400 for invalid start date format", async () => {
      const errorResponse = new Response(
        JSON.stringify({
          message: "Invalid start date format. Use YYYY-MM-DD.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      (getUrlsFromRequest as jest.Mock).mockResolvedValue(errorResponse);

      const response = await GET(createMockRequest("?start=invalid-date"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "Invalid start date format. Use YYYY-MM-DD.",
      );
    });

    it("should return 400 for invalid end date format", async () => {
      const errorResponse = new Response(
        JSON.stringify({ message: "Invalid end date format. Use YYYY-MM-DD." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      (getUrlsFromRequest as jest.Mock).mockResolvedValue(errorResponse);

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
      const errorResponse = new Response(
        JSON.stringify({
          message: "Start date is required when end date is provided.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      (getUrlsFromRequest as jest.Mock).mockResolvedValue(errorResponse);

      const response = await GET(createMockRequest("?end=2025-01-31"));

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe(
        "Start date is required when end date is provided.",
      );
    });

    it("should return 400 when end date is before start date", async () => {
      const errorResponse = new Response(
        JSON.stringify({ message: "End date must be later than start date." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      (getUrlsFromRequest as jest.Mock).mockResolvedValue(errorResponse);

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
      const errorResponse = new Response(
        JSON.stringify({ message: "Start date cannot be in the future." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      (getUrlsFromRequest as jest.Mock).mockResolvedValue(errorResponse);

      const response = await GET(
        createMockRequest("?start=2026-01-01&end=2026-01-31"),
      );

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse.message).toBe("Start date cannot be in the future.");
    });

    it("should handle same start and end date", async () => {
      (getUrlsFromRequest as jest.Mock).mockResolvedValue({
        startDate: new Date("2025-01-15T00:00:00.000Z"),
        endDate: new Date("2025-01-15T23:59:59.999Z"),
        urls: mockUrls,
      });

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
      const mockData = [
        {
          scenario_id: "A",
          runs: 5,
          success_count: 4,
          failed_count: 1,
          success_rate: 80.0,
        },
      ];
      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ total_count: 1 }])
        .mockResolvedValueOnce(mockData);
    });

    it("should call getUrlsFromRequest with request object when dates provided", async () => {
      (getUrlsFromRequest as jest.Mock).mockResolvedValue({
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        endDate: new Date("2025-01-31T23:59:59.999Z"),
        urls: mockUrls,
      });

      const mockRequest = createMockRequest("?start=2025-01-01&end=2025-01-31");
      await GET(mockRequest);

      expect(getUrlsFromRequest).toHaveBeenCalledWith(mockRequest.request);
    });

    it("should call getUrlsFromRequest with request object when no dates provided", async () => {
      (getUrlsFromRequest as jest.Mock).mockResolvedValue({
        startDate: undefined,
        endDate: undefined,
        urls: mockUrls,
      });

      const mockRequest = createMockRequest();
      await GET(mockRequest);

      expect(getUrlsFromRequest).toHaveBeenCalledWith(mockRequest.request);
    });
  });
});

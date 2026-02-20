import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/admin/services/[id]/benchmarks.json";
import { getUrlsFromRequest } from "@/lib/parquet-datasource";
import { executeQuery } from "@/lib/db";
import type { AdminBenchmarkData } from "@/types/models/benchmark";

vi.mock("@/lib/parquet-datasource", () => ({
  getUrlsFromRequest: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  PARQUET_MONTH_COVERAGE: "2",
}));

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

vi.mock("@/acl-mapping.json", () => ({
  default: {
    acl: {
      admin: ["@vito.be"],
    },
    records: {
      "scenario-123": ["@vito.be"],
    },
  },
}));

describe("Admin API Route: GET /api/admin/services/{id}/benchmarks.json", () => {
  const mockScenarioId = "scenario-123";
  const mockUrls = ["https://example.com/data.parquet"];

  const createMockRequest = (queryParams: string = "", locals: any = {}) =>
    ({
      params: { id: mockScenarioId },
      request: {
        url: `https://example.com/api/admin/scenarios/${mockScenarioId}/benchmarks.json${queryParams}`,
      },
      locals: {
        user: {
          emailDomain: "@vito.be",
        },
        ...locals,
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
    it("should return success for a scenario", async () => {
      const mockData: AdminBenchmarkData[] = [
        {
          scenario_id: "scenario-123",
          cpu: 100,
          memory: 200,
          costs: 300,
          duration: 400.5,
          input_pixel: 500,
          max_executor_memory: 600,
          network_received: 700,
          start_time: "2024-02-27T12:00:00Z",
          area_size: 400,
          status: "passed",
        },
      ];

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
      (getUrlsFromRequest as jest.Mock).mockRejectedValue(
        new Error("API failure"),
      );

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
      const mockData: AdminBenchmarkData[] = [
        {
          scenario_id: "scenario-123",
          cpu: 150,
          memory: 250,
          costs: 350,
          duration: 450.5,
          input_pixel: 550,
          max_executor_memory: 650,
          network_received: 750,
          start_time: "2025-01-15T10:30:00Z",
          area_size: 400,
          status: "passed",
        },
      ];

      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
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
          url: `https://example.com/api/admin/scenarios/${mockScenarioId}/benchmarks.json?start=2025-01-01&end=2025-01-31`,
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
      const mockData: AdminBenchmarkData[] = [
        {
          scenario_id: "scenario-123",
          cpu: 100,
          memory: 200,
          costs: 300,
          duration: 400.5,
          input_pixel: 500,
          max_executor_memory: 600,
          network_received: 700,
          start_time: "2024-02-27T12:00:00Z",
          area_size: 400,
          status: "passed",
        },
      ];

      (executeQuery as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
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

    it("should verify scenario ID is properly included in SQL queries", async () => {
      await GET(createMockRequest());

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining(`WHERE "scenario_id" = '${mockScenarioId}'`),
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/services/[id]/benchmarks.json";
import { getUrls } from "@/lib/parquet-datasource";
import { executeQuery } from "@/lib/db";

vi.mock("@/lib/parquet-datasource", () => ({
  getUrls: vi.fn(),
  isCacheExpired: vi.fn().mockReturnValue(true),
  updateCacheExpiration: vi.fn(),
  PARQUET_MONTH_COVERAGE: "2",
}));

vi.mock("@/lib/db", () => ({
  executeQuery: vi.fn(),
}));

describe("Public Services API Route: GET /api/services/{id}/benchmarks.json", () => {
  const mockScenarioId = "scenario-123";
  const mockUrls = ["https://example.com/data.parquet"];

  const createMockRequest = () =>
    ({
      params: { id: mockScenarioId },
      request: {
        url: `https://example.com/api/services/${mockScenarioId}/benchmarks.json`,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getUrls as jest.Mock).mockResolvedValue(mockUrls);
  });

  it("should return benchmark data for a specific scenario", async () => {
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

    // Verify that getUrls is called without date parameters (uses default range)
    expect(getUrls).toHaveBeenCalledWith();
    expect(executeQuery).toHaveBeenCalled();

    // Verify default date filter is applied (last 2 months)
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        `DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2' MONTH`,
      ),
    );

    // Verify scenario ID filter is included
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining(`WHERE "scenario_id" = '${mockScenarioId}'`),
    );
  });

  it("should return empty data array when no benchmarks exist for scenario", async () => {
    (executeQuery as jest.Mock).mockResolvedValue([]);

    const response = await GET(createMockRequest());
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      scenario_id: mockScenarioId,
      data: [],
    });
  });

  it("should return a 500 error response when parquet URL generation fails", async () => {
    (getUrls as jest.Mock).mockRejectedValue(
      new Error("Parquet file not found"),
    );

    const response = await GET(createMockRequest());

    expect(response.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: `Fetching benchmark data for service ${mockScenarioId} failed.`,
    });

    expect(getUrls).toHaveBeenCalledOnce();
    expect(executeQuery).not.toHaveBeenCalled();
  });

  it("should return a 500 error response when database query fails", async () => {
    (executeQuery as jest.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await GET(createMockRequest());

    expect(response.status).toBe(500);

    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      message: `Fetching benchmark data for service ${mockScenarioId} failed.`,
    });

    expect(getUrls).toHaveBeenCalledOnce();
    expect(executeQuery).toHaveBeenCalled();
  });
});

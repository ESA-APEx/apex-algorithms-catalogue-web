import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getUrls } from "./parquet-datasource";

const baseUrl =
  "https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet";

global.fetch = vi.fn();

describe("getUrls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("PARQUET_MONTH_COVERAGE", "2");
    vi.stubEnv(
      "PARQUET_FILE_TEMPLATE",
      "https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet/[YEAR]-[MONTH]/part-0.parquet",
    );
    vi.stubEnv("PARQUET_FILE_EXPIRATION", "1");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("should fetch URLs and return them when they exist", async () => {
    const existingUrl = [
      `${baseUrl}/2024-07/part-0.parquet`,
      `${baseUrl}/2024-08/part-0.parquet`,
      `${baseUrl}/2024-09/part-0.parquet`,
    ];

    (fetch as jest.Mock).mockResolvedValue({ ok: true });

    const currentDate = new Date("2024-09-01");
    vi.setSystemTime(currentDate);

    const result = await getUrls();

    expect(result).toEqual(existingUrl);
    expect(result.length).toBe(3);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("should return an empty array if no URLs exist", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    const currentDate = new Date("2024-08-01");
    vi.setSystemTime(currentDate);

    const result = await getUrls();

    expect(result).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

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

    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const currentDate = new Date("2024-09-01");
    vi.setSystemTime(currentDate);

    const result = await getUrls();

    expect(result).toEqual(existingUrl);
    expect(result.length).toBe(3);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("should report HTTP statuses when no URLs exist", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 403 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response);

    const currentDate = new Date("2024-08-01");
    vi.setSystemTime(currentDate);

    await expect(getUrls()).rejects.toThrow(
      "No benchmark Parquet files found. Source: https://s3.waw3-1.cloudferro.com. 2024-06: HTTP 403, 2024-07: HTTP 404, 2024-08: HTTP 503",
    );
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("should keep available URLs when some months are missing", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response);
    vi.setSystemTime(new Date("2024-08-01"));

    await expect(getUrls()).resolves.toEqual([
      `${baseUrl}/2024-07/part-0.parquet`,
    ]);
  });

  it("reports when no months were checked", async () => {
    await expect(getUrls("2024-09-01", "2024-08-01")).rejects.toThrow(
      "No benchmark Parquet files found. Source: https://s3.waw3-1.cloudferro.com. No months were checked.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

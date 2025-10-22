import { formatDate, compareAsc, add as addDate, startOfMonth } from "date-fns";

export const PARQUET_MONTH_COVERAGE =
  import.meta.env.PARQUET_MONTH_COVERAGE || "2";
const PARQUET_FILE_TEMPLATE =
  import.meta.env.PARQUET_FILE_TEMPLATE ||
  "https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet/[YEAR]-[MONTH]/part-0.parquet";
const PARQUET_FILE_EXPIRATION = import.meta.env.PARQUET_FILE_EXPIRATION || "1"; // in hours

const urlExists = async (url: string) => {
  const result = await fetch(url, { method: "HEAD" });
  return result.ok;
};

export const isCacheExpired = () => {
  const now = new Date();
  return !!global.cachedUrlsExpireTime
    ? now >= global.cachedUrlsExpireTime
    : true;
};

export const updateCacheExpiration = () => {
  const now = new Date();
  global.cachedUrlsExpireTime = addDate(now, {
    hours: Number(PARQUET_FILE_EXPIRATION),
  });
};

export const getUrls = async (
  startDate?: string,
  endDate?: string,
): Promise<string[]> => {
  if (PARQUET_FILE_TEMPLATE) {
    const now = new Date();
    const start = startDate
      ? startOfMonth(new Date(startDate))
      : addDate(now, { months: -Number(PARQUET_MONTH_COVERAGE) });

    let template = PARQUET_FILE_TEMPLATE;
    let cursor = new Date(start);
    const endCursor = endDate ? startOfMonth(new Date(endDate)) : now;
    const urls: string[] = [];

    while (compareAsc(endCursor, cursor) >= 0) {
      const url = template
        .replace("[YEAR]", formatDate(cursor, "yyyy"))
        .replace("[MONTH]", formatDate(cursor, "MM"));

      const exists = await urlExists(url);

      if (exists) {
        urls.push(url);
      }
      cursor = addDate(cursor, { months: 1 });
    }
    return urls;
  } else {
    return [];
  }
};

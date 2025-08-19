import { formatDate, compareAsc, add as addDate } from "date-fns";

export const PARQUET_MONTH_COVERAGE =
  import.meta.env.PARQUET_MONTH_COVERAGE || "2";
const PARQUET_FILE_TEMPLATE =
  import.meta.env.PARQUET_FILE_TEMPLATE ||
  "https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet/[YEAR]-[MONTH]/part-0.parquet";
const PARQUET_FILE_EXPIRATION = import.meta.env.PARQUET_FILE_EXPIRATION || "1"; // in hours

global.cachedUrls = [];

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

const updateCacheExpiration = () => {
  const now = new Date();
  global.cachedUrlsExpireTime = addDate(now, {
    hours: Number(PARQUET_FILE_EXPIRATION),
  });
};

export const getUrls = async (): Promise<string[]> => {
  const now = new Date();
  const start = addDate(now, { months: -Number(PARQUET_MONTH_COVERAGE) });

  if (global.cachedUrls.length > 0 && !isCacheExpired()) {
    return global.cachedUrls;
  }

  if (PARQUET_FILE_TEMPLATE) {
    let template = PARQUET_FILE_TEMPLATE;
    let cursor = new Date(start);
    const urls: string[] = [];

    while (compareAsc(now, cursor) >= 0) {
      const url = template
        .replace("[YEAR]", formatDate(cursor, "yyyy"))
        .replace("[MONTH]", formatDate(cursor, "MM"));

      const exists = await urlExists(url);

      if (exists) {
        urls.push(url);
      }
      cursor = addDate(cursor, { months: 1 });
    }

    global.cachedUrls = urls;
    updateCacheExpiration();

    return urls;
  } else {
    return [];
  }
};

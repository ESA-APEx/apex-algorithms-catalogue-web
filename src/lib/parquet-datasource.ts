import { formatDate, compareAsc, add as addDate, startOfMonth } from "date-fns";
import { validateDateParameters } from "@/lib/api-validation";

export const PARQUET_MONTH_COVERAGE =
  import.meta.env.PARQUET_MONTH_COVERAGE || "2";
const PARQUET_FILE_TEMPLATE =
  import.meta.env.PARQUET_FILE_TEMPLATE ||
  "http://localhost:4321/fixtures/benchmarks/[YEAR]-[MONTH].parquet";
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

interface UrlsFromRequest {
  startDate?: Date;
  endDate?: Date;
  urls: string[];
}

export const getUrlsFromRequest = async (
  request: Request,
): Promise<UrlsFromRequest | Response> => {
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get("start") || undefined;
  const endDateParam = url.searchParams.get("end") || undefined;

  const dateValidation = validateDateParameters(startDateParam, endDateParam);
  if (!dateValidation.success) {
    return dateValidation.errorResponse!;
  }

  const { startDate, endDate } = dateValidation;

  let urls: string[];
  if (startDate && endDate) {
    urls = await getUrls(startDateParam, endDateParam);
  } else {
    urls = await getUrls();
  }

  return {
    startDate,
    endDate,
    urls,
  };
};

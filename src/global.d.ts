import { Database } from "duckdb-async";

declare global {
  var cachedUrls: string[];
  var cachedUrlsExpireTime: Date;
  var db: Database | null;
  var dbInitPromise: Promise<Database> | null;
}

export {};

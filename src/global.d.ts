import { Database } from 'duckdb-async';

declare global {
    var cachedUrls: string[];
    var db: Database | null;
    var dbInitPromise: Promise<Database> | null;
}

export {};
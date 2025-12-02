import { Database } from "duckdb-async";
import type { DefaultSession } from "@auth/core/types";

declare global {
  var cachedUrls: string[];
  var cachedUrlsExpireTime: Date;
  var db: Database | null;
  var dbInitPromise: Promise<Database> | null;
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      username?: string;
      roles?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    roles?: string[];
  }

  interface JWT {
    username?: string;
    roles?: string[];
  }

  interface Profile {
    preferred_username?: string;
    realm_access?: {
      roles: string[];
    };
  }
}

export {};

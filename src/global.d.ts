import { Database } from "duckdb-async";
import type { DefaultSession } from "@auth/core/types";

declare global {
  var cachedUrls: string[];
  var cachedUrlsExpireTime: Date;
  var db: Database | null;
  var dbInitPromise: Promise<Database> | null;
}

declare global {
  interface Window {
    signIn: typeof import("auth-astro/client").signIn;
    signOut: typeof import("auth-astro/client").signOut;
    toast: typeof import("sonner").toast;
  }
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
    refresh_token?: string;
  }

  interface Profile {
    preferred_username?: string;
    realm_access?: {
      roles: string[];
    };
  }
}

export {};

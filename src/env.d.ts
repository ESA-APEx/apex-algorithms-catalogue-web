/// <reference path="../.astro/types.d.ts" />
declare module "chartjs-adapter-date-fns";

declare namespace App {
  interface Locals {
    user?: {
      name?: string | null;
      username?: string;
      email?: string | null;
      roles?: string[];
      emailDomain?: string | null;
    };
  }
}

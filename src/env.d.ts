/// <reference path="../.astro/types.d.ts" />
declare module "chartjs-adapter-date-fns";

declare namespace App {
  interface Locals {
    user?: {
      username?: string;
      email?: string | null;
      roles?: string[];
    };
  }
}

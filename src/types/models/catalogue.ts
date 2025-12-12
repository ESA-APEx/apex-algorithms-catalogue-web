import type { Algorithm } from "./algorithm";
import type { Platform } from "./platform";
import type { ApplicationDetails } from "@/types/models/application.ts";

export interface Catalogue {
  algorithm: Algorithm;
  applicationDetails?: ApplicationDetails;
  platform?: Platform;
}

export interface ToCElement {
  depth: number;
  title: string;
  id: string;
}

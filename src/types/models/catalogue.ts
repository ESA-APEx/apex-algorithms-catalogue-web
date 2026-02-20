import type { Algorithm } from "./algorithm";
import type { Platform } from "./platform";
import type { ApplicationDetails } from "./application";
import type { Provider } from "./provider";
import type { BenchmarkScenario } from "./benchmark-scenario";

export interface Catalogue {
  algorithm: Algorithm;
  applicationDetails?: ApplicationDetails;
  platform?: Platform;
  provider?: Provider;
  benchmarkScenarios: BenchmarkScenario[];
}

export interface ToCElement {
  depth: number;
  title: string;
  id: string;
}

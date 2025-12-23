import type { Algorithm } from "./algorithm";
import type { Platform } from "./platform";
import type { ApplicationDetails } from "./application";
import type { Provider } from "./provider";

export interface Catalogue {
  algorithm: Algorithm;
  applicationDetails?: ApplicationDetails;
  platform?: Platform;
  provider?: Provider;
}

export interface ToCElement {
  depth: number;
  title: string;
  id: string;
}

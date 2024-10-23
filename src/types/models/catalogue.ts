import type { Algorithm } from "./algorithm";
import type { UDP } from "./udp";

export interface Catalogue {
    algorithm: Algorithm
    udp: UDP
}
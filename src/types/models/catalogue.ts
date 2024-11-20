import type { Algorithm } from "./algorithm";
import type { UDP } from "./udp";

export interface Catalogue {
    algorithm: Algorithm
    udp?: UDP
}

export interface ToCElement {
    depth: number
    title: string
    id: string
}
import type { Algorithm } from "./algorithm";
import type {ApplicationDetails} from "@/types/models/application.ts";

export interface Catalogue {
    algorithm: Algorithm
    applicationDetails?: ApplicationDetails;
}

export interface ToCElement {
    depth: number
    title: string
    id: string
}
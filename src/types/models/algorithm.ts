export enum AlgorithmType {
  NONE = "Unknown",
  OPENEO = "openEO",
  OGC_API_PROCESS = "OGC API Process",
}

export interface Algorithm {
  id: string;
  type: AlgorithmType;
  conformsTo: string[];
  properties: Properties;
  linkTemplates: any[];
  links: Link[];
}

export interface Properties {
  created: string;
  updated: string;
  type: string;
  title: string;
  description: string;
  cost_estimate: number;
  cost_unit: string;
  keywords: string[];
  language: Language;
  languages: Language2[];
  contacts: Contact[];
  themes: Theme[];
  formats: Format[];
  license: string;
  visibility?: "public" | "private" | undefined;
}

export interface Language {
  code: string;
  name: string;
}

export interface Language2 {
  code: string;
  name: string;
}

export interface Contact {
  name: string;
  position?: string;
  organization?: string;
  links: Link[];
  email?: string;
  contactInstructions: string;
  roles: string[];
}

export interface Link {
  href: string;
  rel: string;
  type: string;
  title: string;
}

export interface Theme {
  concepts: Concept[];
  scheme: string;
}

export interface Format {
  name: string;
}

export interface Concept {
  id: string;
}

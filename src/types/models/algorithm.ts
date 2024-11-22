export interface Algorithm {
  id: string
  type: string
  conformsTo: string[]
  properties: Properties
  linkTemplates: any[]
  links: Link2[]
}

export interface Properties {
  created: string
  updated: string
  type: string
  title: string
  description: string
  cost_estimate: number
  cost_unit: string
  keywords: string[]
  language: Language
  languages: Language2[]
  contacts: Contact[]
  themes: Theme[]
  formats: Format[]
  license: string
}

export interface Language {
  code: string
  name: string
}

export interface Language2 {
  code: string
  name: string
}

export interface Contact {
  name: string
  position?: string
  organization?: string
  links: Link[]
  contactInstructions: string
  roles: string[]
}

export interface Link {
  href: string
  rel: string
  type: string
}

export interface Theme {
  concepts: Concept[]
  scheme: string
}

export interface Format {
  name: string;
}

export interface Concept {
  id: string
}

export interface Link2 {
  rel: string
  type?: string
  title?: string
  href: string
}

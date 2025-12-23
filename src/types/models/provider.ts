export interface Provider {
  id: string
  type: string
  conformsTo: string[]
  properties: Properties
  linkTemplates: any[]
  links: Link[]
}

export interface Properties {
  created: string
  updated: string
  type: string
  title: string
  short_title?: string
  description: string
  keywords: any[]
  language: Language
  languages: Language[]
  contacts: any[]
  themes: any[]
  license: string
}

export interface Language {
  code: string
  name: string
}

export interface Link {
  rel: string
  type: string
  title: string
  href: string
}

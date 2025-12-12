export interface Platform {
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
  contacts: Contact[]
  themes: any[]
  license: string
}

export interface Language {
  code: string
  name: string
}

export interface Contact {
  name: string
  organization: string
  position: string
  roles: string[]
  links: Link[]
  contactInstructions: string
  email: string
}

export interface Link {
  href: string
  title: string
  rel: string
  type: string
}
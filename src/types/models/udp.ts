export interface UDP {
  process_graph: any;
  id: string
  summary: string
  description: string
  parameters: Parameter[]
}

export interface Parameter {
  name: string
  description: string
  schema: Schema
  optional?: boolean
  default?: string[]
}

export interface Schema {
  type: string
  subtype?: string
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
  items?: Items
}

export interface Items {
  type?: string
  enum?: string[]
  anyOf?: AnyOf[]
}

export interface AnyOf {
  type: string
  subtype?: string
  format?: string
}
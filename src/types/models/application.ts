
export interface Parameter {
    name: string
    description: string
    schema: string;
    optional?: boolean
    default?: string[]
}
export interface ApplicationDetails {
    id: string
    summary: string
    description: string
    parameters: Parameter[];
}
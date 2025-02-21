import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

import type {ApplicationDetails} from "@/types/models/application.ts";

export interface CatalogueDetailParametersTableProps {
    details: ApplicationDetails
}

export const CatalogueDetailParametersTable = ({ details }: CatalogueDetailParametersTableProps) => {
    return (
        <>
            <Table className="bg-white bg-opacity-5 rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Parameter</TableHead>
                        <TableHead>Type</TableHead> 
                        <TableHead>Default</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {details.parameters.map((parameter) => (
                        <TableRow key={parameter.name}>
                            <TableCell>
                                <p className="mb-1">{parameter.name} {!parameter?.optional && <span>(required)</span>}</p>
                                <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{__html: parameter.description}}></p>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <span>{parameter.schema}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {
                                    parameter.hasOwnProperty('default') && typeof parameter.default === 'object' ? 
                                    JSON.stringify(parameter.default) : 
                                    parameter.default
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
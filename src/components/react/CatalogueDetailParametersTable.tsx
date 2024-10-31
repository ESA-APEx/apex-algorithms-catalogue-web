import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

import type { UDP } from '../../types/models/udp';

export interface CatalogueDetailParametersTableProps {
    udp: UDP
}

export const CatalogueDetailParametersTable = ({ udp }: CatalogueDetailParametersTableProps) => {
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Parameter</TableHead>
                        <TableHead>Type</TableHead> 
                        <TableHead>Default</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {udp.parameters.map((parameter) => (                           
                        <TableRow key={parameter.name}>
                            <TableCell>
                                <p className="mb-1">{parameter.name} {!parameter?.optional && <span>(required)</span>}</p>
                                <p className="text-sm text-gray-300">{parameter.description}</p>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <span>{parameter.schema.type}</span> 
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
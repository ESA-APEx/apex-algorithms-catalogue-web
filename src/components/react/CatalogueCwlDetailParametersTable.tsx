import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { getCwlProcessDefinition } from "@/lib/api";
import type { ApplicationDetails } from "@/types/models/application";

export interface CatalogueCwlDetailParametersTableProps {
    cwlUrl: string;
}

export const CatalogueCwlDetailParametersTable = ({ cwlUrl }: CatalogueCwlDetailParametersTableProps) => {
    const [details, setDetails] = useState<ApplicationDetails>();
    const [loading, setLoading] = useState<boolean>(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await getCwlProcessDefinition(cwlUrl);
            setDetails(response);
        } catch (error) {
            console.error(`Error when fetching the cwl process definition: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!details) {
            fetchDetail();    
        }
    }, [])

    return loading ? <p>Fetching parameters...</p> 
        : (
            details && (
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
                                        <p className="text-sm text-gray-300">
                                            {parameter.description}
                                        </p>
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
        );
}
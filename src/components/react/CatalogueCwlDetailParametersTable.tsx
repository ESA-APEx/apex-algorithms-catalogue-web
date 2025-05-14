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
import { isFeatureEnabled } from '@/lib/featureflag';
import type { ApplicationDetails } from "@/types/models/application";

export interface CatalogueCwlDetailParametersTableProps {
    cwlUrl: string;
}

export const CatalogueCwlDetailParametersTable = ({ cwlUrl }: CatalogueCwlDetailParametersTableProps) => {
    const isEnabled = isFeatureEnabled(window.location.href, 'benchmarkStatus');
    const [details, setDetails] = useState<ApplicationDetails>();
    const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'protected'>('loading');

    const fetchDetail = async () => {
        setStatus('loading');
        try {
            const response = await getCwlProcessDefinition(cwlUrl);
            setDetails(response);
            setStatus('success');
        } catch (error: any) {
            console.error(`Error when fetching the cwl process definition: ${JSON.stringify(error)}`);
            if (error.status === 'protected') {
                setStatus('protected');
            } else {
                setStatus('error');
            }
        }
    }

    useEffect(() => {
        if (!details && isEnabled) {
            fetchDetail();    
        }
    }, [])

    return isEnabled ? 
        (
            status === 'loading' ? <p>Fetching parameters...</p> 
            : (
                details && (
                    <Table className="bg-white bg-opacity-5 rounded-lg" data-testid="parameters-table">
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
                )
            )
        ) : null;
}
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Info } from 'lucide-react';
import { STATUS_THRESHOLD } from './BenchmarkStatus';
import { BenchmarkStatusBadge } from './BenchmarkStatusBadge';
import type { BenchmarkStatusKey } from '@/types/models/benchmark';

export const BenchmarkInfoPopover = () => {
    const numOfStatus = Object.keys(STATUS_THRESHOLD).length;

    return (
        <Popover>
            <PopoverTrigger>
                <Info className="w-4 h-4 text-white rounded-full hover:bg-brand-teal-50/20 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="relative">
                <article>
                    <p className="text-sm mb-2">
                        The percentage of successful executions is categorized into {numOfStatus} status:
                    </p>
                    <ul className="text-sm">
                        {Object.keys(STATUS_THRESHOLD).map((status) => (
                            <li key={status} className="flex items-center gap-1">
                                <BenchmarkStatusBadge status={status as BenchmarkStatusKey} />
                                { 
                                    status === 'no benchmark' ? 
                                    null :
                                    <span>{`(success rate >= ${STATUS_THRESHOLD[status as BenchmarkStatusKey]})`}</span>
                                }
                            </li>
                        ))}
                    </ul>
                </article>
            </PopoverContent>
        </Popover>
    )
}
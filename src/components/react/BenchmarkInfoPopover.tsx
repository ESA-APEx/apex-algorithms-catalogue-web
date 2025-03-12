import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Info } from 'lucide-react';
import { STATUS_THRESHOLD } from './BenchmarkStatus';
import { BenchmarkStatusBadge } from './BenchmarkStatusBadge';

export const BenchmarkInfoPopover = () => {

    return (
        <Popover>
            <PopoverTrigger>
                <Info className="w-4 h-4 text-white rounded-full hover:bg-brand-teal-50/20 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="relative">
                <article>
                    <p className="text-sm mb-2">
                        The percentage of successful executions is categorized into three status:
                    </p>
                    <ul className="text-sm">
                        <li className="flex items-center gap-1 flex-wrap">
                            <BenchmarkStatusBadge status="stable" />
                            <span className="flex-1">{`(success rate >= ${STATUS_THRESHOLD.stable})`}</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <BenchmarkStatusBadge status="unstable" />
                            <span className="flex-1">{`(${STATUS_THRESHOLD.unstable} <= success rate < ${STATUS_THRESHOLD.stable})`}</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <BenchmarkStatusBadge status="no benchmark" />
                        </li>
                    </ul>
                </article>
            </PopoverContent>
        </Popover>
    )
}
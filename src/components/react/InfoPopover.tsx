import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Info } from 'lucide-react';

export interface InfoPopoverProps {
    message: string;
}

export const InfoPopover = ({ message }: InfoPopoverProps) => {

    return (
        <Popover data-testid="info-popover">
            <PopoverTrigger>
                <Info className="w-4 h-4 text-white rounded-full hover:bg-brand-teal-50/20 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="relative" data-testid="info-popover-content">
                <article>
                    <p className="text-sm">
                        {message}
                    </p>
                </article>
            </PopoverContent>
        </Popover>
    )
}